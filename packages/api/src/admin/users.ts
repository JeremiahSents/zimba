import { createHash, randomBytes } from "node:crypto"
import { db } from "@workspace/db"
import {
  findAccountStatus,
  findUserByEmail,
  findUserById,
} from "@workspace/db/auth"
import type { DatabaseExecutor } from "@workspace/db/executor"
import {
  appendPlatformAudit,
  claimPlatformInvitation,
  countSuperAdmins,
  createPlatformAccess,
  createPlatformInvitation,
  deletePlatformAccess,
  findPlatformAccessForUser,
  findPlatformInvitationByTokenHash,
  findPlatformUserDetailRows,
  findPlatformUserForUser,
  listPlatformUserRows,
  listSuperAdminRecipients,
  revokePendingPlatformInvitationsForEmail,
  updatePlatformAccess,
} from "@workspace/db/platform"
import type { PlatformUserDetailDto, PlatformUserListDto } from "../schemas"
import {
  conflictError,
  forbidden,
  notFoundError,
  validationError,
} from "../shared/application-error"

export type PlatformRole = "super_admin" | "support"
export type PlatformAccess = PlatformRole | null

export async function getPlatformAccessForUserUseCase(
  userId: string
): Promise<PlatformAccess> {
  const [platformUser] = await findPlatformUserForUser(db, userId)
  return normalizePlatformRole(platformUser?.role)
}

/**
 * True once a super admin has deactivated the account. Both apps check this
 * while resolving a session, so a cookie issued before the decision stops
 * working on the next request.
 */
export async function isAccountDeactivatedUseCase(
  userId: string
): Promise<boolean> {
  const [account] = await findAccountStatus(db, userId)
  return Boolean(account?.deactivatedAt)
}

export async function listPlatformUsersUseCase(): Promise<
  PlatformUserListDto[]
> {
  const rows = await listPlatformUserRows(db)
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
      deactivatedAt: row.deactivatedAt,
      platformRole: normalizePlatformRole(row.platformRole),
      membershipsCount: row.organizationName ? 1 : 0,
      primaryOrganization: row.organizationName,
    })
  }
  return [...result.values()]
}

/** Recipients for anything super admins must action, e.g. a new client request. */
export async function listSuperAdminRecipientsUseCase(): Promise<
  Array<{ id: string; name: string; email: string }>
> {
  return listSuperAdminRecipients(db)
}

export async function getPlatformUserDetailUseCase(
  id: string
): Promise<PlatformUserDetailDto | null> {
  const rows = await findPlatformUserDetailRows(db, id)
  if (!rows[0]) return null
  const first = rows[0]
  return {
    id: first.id,
    name: first.name,
    email: first.email,
    emailVerified: first.emailVerified,
    image: first.image,
    createdAt: first.createdAt,
    deactivatedAt: first.deactivatedAt,
    deactivationReason: first.deactivationReason,
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
  actorId: string,
  targetId: string,
  role: PlatformRole
) {
  return db.transaction(async (tx) => {
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
  actorId: string,
  targetId: string
) {
  return db.transaction(async (tx) => {
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

function validateSuperAdminInviteInput(input: {
  email: string
  name: string
}) {
  const normalizedEmail = input.email.trim().toLowerCase()
  const name = input.name.trim()
  if (!name || !normalizedEmail.includes("@")) {
    validationError("Enter a name and valid email address.")
  }
  return { name, normalizedEmail }
}

export async function createSuperAdminInviteUseCase(
  actorId: string,
  input: { email: string; name: string }
): Promise<{ token: string; normalizedEmail: string }> {
  const { name, normalizedEmail } = validateSuperAdminInviteInput(input)
  const [existingUser] = await findUserByEmail(db, normalizedEmail)
  if (existingUser) {
    const [existingPlatform] = await findPlatformUserForUser(
      db,
      existingUser.id
    )
    if (existingPlatform)
      conflictError("This user already has platform access.")
  }

  const token = randomBytes(32).toString("base64url")
  const tokenHash = createHash("sha256").update(token).digest("hex")
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

  await db.transaction(async (tx) => {
    await revokePendingPlatformInvitationsForEmail(tx, normalizedEmail)
    await createPlatformInvitation(tx, {
      email: normalizedEmail,
      name,
      role: "super_admin",
      tokenHash,
      invitedById: actorId,
      expiresAt,
    })
    await appendPlatformAudit(tx, {
      actorId,
      targetUserId: existingUser?.id ?? null,
      operation: "super_admin_invite_sent",
      metadata: { email: normalizedEmail, name, role: "super_admin" },
    })
  })

  return { token, normalizedEmail }
}

export async function acceptSuperAdminInviteUseCase(
  ctx: { userId: string; email: string },
  rawToken: unknown
): Promise<void> {
  if (typeof rawToken !== "string" || rawToken.length < 20) {
    validationError("This invitation link is invalid.")
  }

  const tokenHash = createHash("sha256").update(rawToken).digest("hex")
  const [invite] = await findPlatformInvitationByTokenHash(db, tokenHash)
  if (!invite || invite.expiresAt <= new Date()) {
    notFoundError("This invitation is invalid or expired.")
  }

  if (invite.email.trim().toLowerCase() !== ctx.email.trim().toLowerCase()) {
    forbidden("This invitation is for a different account.")
  }

  if (invite.status !== "pending") {
    conflictError("This invitation has already been used.")
  }

  const claimed = await db.transaction(async (tx) => {
    const [result] = await claimPlatformInvitation(tx, invite.id)
    if (!result) return false
    const existing = await findPlatformAccessForUser(tx, ctx.userId)
    if (existing[0]) {
      await updatePlatformAccess(tx, existing[0].id, invite.role)
    } else {
      await createPlatformAccess(tx, ctx.userId, invite.role)
    }
    await appendPlatformAudit(tx, {
      actorId: ctx.userId,
      targetUserId: ctx.userId,
      operation: "super_admin_invite_accepted",
      metadata: { email: invite.email, invitationId: invite.id, role: invite.role },
    })
    return true
  })

  if (!claimed) conflictError("This invitation has already been used.")
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
