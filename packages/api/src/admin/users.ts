import type {
  PlatformUserDetailDto,
  PlatformUserListDto,
} from "@workspace/contracts"
import type {
  DatabaseExecutor,
  TransactionRunner,
} from "@workspace/db/repositories"
import {
  appendPlatformAudit,
  countSuperAdmins,
  createPlatformAccess,
  deletePlatformAccess,
  findPlatformAccessForUser,
  findPlatformUserDetailRows,
  findPlatformUserForUser,
  findUserByEmail,
  findUserById,
  listPlatformUserRows,
  updatePlatformAccess,
} from "@workspace/db/repositories"
import {
  conflictError,
  forbidden,
  notFoundError,
  validationError,
} from "../shared/application-error"

export type PlatformRole = "super_admin" | "support"
export type PlatformAccess = PlatformRole | null

export async function getPlatformAccessForUserUseCase(
  deps: { executor: DatabaseExecutor },
  userId: string
): Promise<PlatformAccess> {
  const [platformUser] = await findPlatformUserForUser(deps.executor, userId)
  return normalizePlatformRole(platformUser?.role)
}

export async function listPlatformUsersUseCase(deps: {
  executor: DatabaseExecutor
}): Promise<PlatformUserListDto[]> {
  const rows = await listPlatformUserRows(deps.executor)
  const result = new Map<string, PlatformUserListDto>()
  for (const row of rows) {
    const existing = result.get(row.id)
    if (existing) {
      existing.membershipsCount += row.organizationName ? 1 : 0
      continue
    }
    result.set(row.id, {
      id: row.id,
      name: row.name,
      email: row.email,
      image: row.image,
      createdAt: row.createdAt,
      platformRole: normalizePlatformRole(row.platformRole),
      membershipsCount: row.organizationName ? 1 : 0,
      primaryOrganization: row.organizationName,
    })
  }
  return [...result.values()]
}

export async function getPlatformUserDetailUseCase(
  deps: { executor: DatabaseExecutor },
  id: string
): Promise<PlatformUserDetailDto | null> {
  const rows = await findPlatformUserDetailRows(deps.executor, id)
  if (!rows[0]) return null
  const first = rows[0]
  return {
    id: first.id,
    name: first.name,
    email: first.email,
    emailVerified: first.emailVerified,
    image: first.image,
    createdAt: first.createdAt,
    platformRole: normalizePlatformRole(first.platformRole),
    membershipsCount: rows.filter((row) => row.organizationId).length,
    primaryOrganization: first.organizationName,
    memberships: rows.flatMap((row) =>
      row.organizationId && row.organizationName && row.membershipRole
        ? [
            {
              organizationId: row.organizationId,
              organizationName: row.organizationName,
              role: row.membershipRole,
            },
          ]
        : []
    ),
  }
}

export async function updatePlatformUserRoleUseCase(
  deps: { transaction: TransactionRunner },
  actorId: string,
  targetId: string,
  role: PlatformRole
) {
  return deps.transaction(async (tx) => {
    await assertUsersExist(tx, actorId, targetId)
    const existing = await findPlatformAccessForUser(tx, targetId)
    if (existing[0]?.role === "super_admin" && role !== "super_admin") {
      const [{ value } = { value: 0 }] = await countSuperAdmins(tx)
      if (Number(value ?? 0) <= 1)
        conflictError("At least one super admin must remain.")
    }
    if (existing[0]) await updatePlatformAccess(tx, existing[0].id, role)
    else await createPlatformAccess(tx, targetId, role)
    await appendPlatformAudit(tx, {
      actorId,
      targetUserId: targetId,
      operation: "role_changed",
      oldRole: existing[0]?.role ?? null,
      newRole: role,
    })
  })
}

export async function removePlatformUserUseCase(
  deps: { transaction: TransactionRunner },
  actorId: string,
  targetId: string
) {
  return deps.transaction(async (tx) => {
    await assertUsersExist(tx, actorId, targetId)
    const existing = await findPlatformAccessForUser(tx, targetId)
    if (!existing[0]) notFoundError("Platform user not found.")
    if (existing[0].role === "super_admin") {
      const [{ value } = { value: 0 }] = await countSuperAdmins(tx)
      if (Number(value ?? 0) <= 1)
        conflictError("At least one super admin must remain.")
    }
    await deletePlatformAccess(tx, existing[0].id)
    await appendPlatformAudit(tx, {
      actorId,
      targetUserId: targetId,
      operation: "platform_access_removed",
      oldRole: existing[0].role,
      newRole: null,
    })
  })
}

export async function validateSuperAdminInviteUseCase(
  deps: { executor: DatabaseExecutor },
  input: { email: string; name: string }
) {
  const normalizedEmail = input.email.trim().toLowerCase()
  if (!input.name.trim() || !normalizedEmail.includes("@")) {
    validationError("Enter a name and valid email address.")
  }

  const [existingUser] = await findUserByEmail(deps.executor, normalizedEmail)
  if (existingUser) {
    const [existingPlatform] = await findPlatformUserForUser(
      deps.executor,
      existingUser.id
    )
    if (existingPlatform)
      conflictError("This user already has platform access.")
  }

  return {
    normalizedEmail,
    existingUserId: existingUser?.id ?? null,
  }
}

async function assertUsersExist(
  executor: DatabaseExecutor,
  actorId: string,
  targetId: string
) {
  if (actorId === targetId)
    forbidden("You cannot change your own platform access.")
  const [actor, target] = await Promise.all([
    findUserById(executor, actorId),
    findUserById(executor, targetId),
  ])
  if (!actor[0] || !target[0]) notFoundError("User not found.")
  const actorAccess = await findPlatformAccessForUser(executor, actorId)
  if (actorAccess[0]?.role !== "super_admin") {
    forbidden("Only super admins can change platform access.")
  }
}

function normalizePlatformRole(
  role: string | null | undefined
): PlatformAccess {
  return role === "super_admin" || role === "support" ? role : null
}
