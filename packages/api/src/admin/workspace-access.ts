import { db } from "@workspace/db"
import type { DatabaseExecutor } from "@workspace/db/executor"
import { findOrganizationById } from "@workspace/db/organizations"
import {
  appendPlatformAudit,
  findActiveGrantForUser,
  findPlatformUserForUser,
  insertGrant,
  revokeGrantById,
  revokeGrantsForUser,
} from "@workspace/db/platform"
import { forbidden, notFoundError } from "../shared/application-error"

/** How long a super admin keeps access before it lapses on its own. */
export const WORKSPACE_GRANT_TTL_MINUTES = 30

export type WorkspaceGrantDto = {
  id: string
  organizationId: string
  organizationName: string
  slug: string
  role: string
  expiresAt: Date
  createdAt: Date
}

export type GrantResult = {
  slug: string
  expiresAt: Date
}

async function assertSuperAdmin(
  executor: DatabaseExecutor,
  userId: string
): Promise<void> {
  const [platformUser] = await findPlatformUserForUser(executor, userId)
  if (platformUser?.role !== "super_admin") {
    forbidden("Only super admins can access client workspaces.")
  }
}

export async function grantWorkspaceAccessUseCase(input: {
  actorId: string
  organizationId: string
}): Promise<GrantResult> {
  return db.transaction(async (tx) => {
    await assertSuperAdmin(tx, input.actorId)

    const [org] = await findOrganizationById(tx, input.organizationId)
    if (!org) notFoundError("Organization not found.")

    // One workspace at a time: opening a new one closes whatever was open.
    await revokeGrantsForUser(tx, input.actorId)

    const expiresAt = new Date(
      Date.now() + WORKSPACE_GRANT_TTL_MINUTES * 60 * 1000
    )

    const [grant] = await insertGrant(tx, {
      userId: input.actorId,
      organizationId: input.organizationId,
      role: "owner",
      expiresAt,
    })

    await appendPlatformAudit(tx, {
      actorId: input.actorId,
      operation: "workspace_access.granted",
      metadata: {
        grantId: grant?.id,
        organizationId: input.organizationId,
        expiresAt: expiresAt.toISOString(),
      },
    })

    return { slug: org.slug, expiresAt }
  })
}

/**
 * Ends the caller's own access. Deliberately idempotent and free of a super
 * admin check: giving up access must never be the thing that fails.
 */
export async function revokeWorkspaceAccessUseCase(input: {
  actorId: string
}): Promise<void> {
  return db.transaction(async (tx) => {
    const [existing] = await findActiveGrantForUser(tx, input.actorId)

    await revokeGrantsForUser(tx, input.actorId)

    if (!existing) return

    await appendPlatformAudit(tx, {
      actorId: input.actorId,
      operation: "workspace_access.revoked",
      metadata: {
        grantId: existing.id,
        organizationId: existing.organizationId,
      },
    })
  })
}

/**
 * Lets the customer app tell platform staff apart from a stranger poking at a
 * workspace URL, so a lapsed grant can explain itself instead of 404ing.
 */
export async function isPlatformStaffUseCase(userId: string): Promise<boolean> {
  const [platformUser] = await findPlatformUserForUser(db, userId)
  return Boolean(platformUser)
}

export async function getActiveWorkspaceGrantUseCase(
  userId: string
): Promise<WorkspaceGrantDto | null> {
  const [grant] = await findActiveGrantForUser(db, userId)
  return grant ?? null
}

export async function revokeGrantByIdUseCase(input: {
  actorId: string
  grantId: string
}): Promise<void> {
  return db.transaction(async (tx) => {
    await assertSuperAdmin(tx, input.actorId)

    await revokeGrantById(tx, input.grantId)

    await appendPlatformAudit(tx, {
      actorId: input.actorId,
      operation: "workspace_access.revoked",
      metadata: { grantId: input.grantId },
    })
  })
}
