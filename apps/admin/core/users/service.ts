import "server-only"

import { db } from "@workspace/db"
import {
  appendPlatformAudit,
  countSuperAdmins,
  createPlatformAccess,
  deletePlatformAccess,
  findPlatformUserDetailRows,
  findPlatformAccessForUser,
  findUserById,
  listPlatformUserRows,
  updatePlatformAccess,
} from "@workspace/db/repositories"
import {
  organization,
  organizationMember,
  platformAuditLog,
  platformUser,
  user,
} from "@workspace/db/schema"
import { count, desc, eq } from "drizzle-orm"
import type { PlatformRole } from "../auth/service"
import { conflict, forbidden, notFound } from "../shared/errors"
import type {
  PlatformUserDetailDto,
  PlatformUserListDto,
} from "@workspace/contracts"
export type {
  PlatformUserDetailDto,
  PlatformUserListDto,
} from "@workspace/contracts"

export async function listPlatformUsers(): Promise<PlatformUserListDto[]> {
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
      platformRole:
        row.platformRole === "super_admin" || row.platformRole === "support"
          ? row.platformRole
          : null,
      membershipsCount: row.organizationName ? 1 : 0,
      primaryOrganization: row.organizationName,
    })
  }
  return [...result.values()]
}
export async function getPlatformUserDetail(
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
    platformRole:
      first.platformRole === "super_admin" || first.platformRole === "support"
        ? first.platformRole
        : null,
    membershipsCount: rows.filter((r) => r.organizationId).length,
    primaryOrganization: first.organizationName,
    memberships: rows.flatMap((r) =>
      r.organizationId && r.organizationName && r.membershipRole
        ? [
            {
              organizationId: r.organizationId,
              organizationName: r.organizationName,
              role: r.membershipRole,
            },
          ]
        : []
    ),
  }
}

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0]
async function assertUsersExist(
  tx: Transaction,
  actorId: string,
  targetId: string
) {
  if (actorId === targetId)
    forbidden("You cannot change your own platform access.")
  const [actor, target] = await Promise.all([
    findUserById(tx, actorId),
    findUserById(tx, targetId),
  ])
  if (!actor[0] || !target[0]) notFound("User not found.")
}

export async function updatePlatformUserRole(
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
        conflict("At least one super admin must remain.")
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

export async function removePlatformUser(actorId: string, targetId: string) {
  return db.transaction(async (tx) => {
    await assertUsersExist(tx, actorId, targetId)
    const existing = await findPlatformAccessForUser(tx, targetId)
    if (!existing[0]) notFound("Platform user not found.")
    if (existing[0].role === "super_admin") {
      const [{ value } = { value: 0 }] = await countSuperAdmins(tx)
      if (Number(value ?? 0) <= 1)
        conflict("At least one super admin must remain.")
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
