import { db } from "@workspace/db"
import {
  deactivateUser,
  deleteSessionsForUser,
  deleteUser,
  findAccountSummary,
  findUserForUpdate,
  reactivateUser,
} from "@workspace/db/auth"
import type { DatabaseExecutor } from "@workspace/db/executor"
import {
  countPendingInvitationsFromUser,
  findSoleOwnerOrganizationsForUser,
} from "@workspace/db/organizations"
import {
  appendPlatformAudit,
  countSuperAdmins,
  findPlatformAccessForUser,
  revokeGrantsForUser,
} from "@workspace/db/platform"
import type {
  AccountRemovalBlocker,
  AccountRemovalPreviewDto,
} from "../schemas"
import {
  conflictError,
  forbidden,
  notFoundError,
  validationError,
} from "../shared/application-error"

/**
 * Deleting an account is the one platform action that cannot be undone, so it
 * is split in two:
 *
 * - `deactivate` is the everyday path. The row survives, every receipt and
 *   audit entry keeps its author, and the person simply cannot sign in.
 * - `delete` is permanent, and refuses to run while anything still depends on
 *   the account. The blockers are readable up front via the preview, so an
 *   admin sees why before clicking rather than after.
 */

type AccountSnapshot = {
  id: string
  name: string
  email: string
  createdAt: Date
  deactivatedAt: Date | null
  deactivatedBy: string | null
  deactivationReason: string | null
}

export async function getAccountRemovalPreviewUseCase(
  actorId: string,
  targetId: string
): Promise<AccountRemovalPreviewDto | null> {
  const [target] = await findAccountSummary(db, targetId)
  if (!target) return null

  const blockers = await collectBlockers(db, actorId, target)
  return {
    userId: target.id,
    name: target.name,
    email: target.email,
    deactivatedAt: target.deactivatedAt,
    deactivationReason: target.deactivationReason,
    blockers,
    canDelete: blockers.length === 0,
  }
}

export async function deactivateUserAccountUseCase(
  actorId: string,
  targetId: string,
  reason?: string
): Promise<{ email: string }> {
  const trimmedReason = reason?.trim() ?? ""
  if (trimmedReason.length > 2000)
    validationError("Keep the reason under 2000 characters.")

  return db.transaction(async (tx) => {
    await assertSuperAdminActor(tx, actorId, targetId)
    const target = await requireAccount(tx, targetId)
    if (target.deactivatedAt)
      conflictError("This account is already deactivated.")
    await assertNotLastSuperAdmin(tx, targetId)

    const updated = await deactivateUser(tx, targetId, {
      deactivatedBy: actorId,
      reason: trimmedReason || null,
    })
    if (!updated) notFoundError("User not found.")

    // A live cookie would otherwise outlast the decision by up to a week.
    await deleteSessionsForUser(tx, targetId)
    await revokeGrantsForUser(tx, targetId)

    await appendPlatformAudit(tx, {
      actorId,
      targetUserId: targetId,
      operation: "user_account_deactivated",
      metadata: {
        email: target.email,
        name: target.name,
        reason: trimmedReason || null,
      },
    })

    return { email: updated.email }
  })
}

export async function reactivateUserAccountUseCase(
  actorId: string,
  targetId: string
): Promise<{ email: string }> {
  return db.transaction(async (tx) => {
    await assertSuperAdminActor(tx, actorId, targetId)
    const target = await requireAccount(tx, targetId)
    if (!target.deactivatedAt) conflictError("This account is already active.")

    const updated = await reactivateUser(tx, targetId)
    if (!updated) notFoundError("User not found.")

    await appendPlatformAudit(tx, {
      actorId,
      targetUserId: targetId,
      operation: "user_account_reactivated",
      metadata: { email: target.email, name: target.name },
    })

    return { email: updated.email }
  })
}

/**
 * Permanent. `confirmEmail` must match the account being deleted — the admin
 * types the address, so a mis-click on the wrong row cannot destroy anyone.
 */
export async function deleteUserAccountUseCase(
  actorId: string,
  targetId: string,
  confirmEmail: string
): Promise<{ email: string }> {
  return db.transaction(async (tx) => {
    await assertSuperAdminActor(tx, actorId, targetId)
    const target = await requireAccount(tx, targetId)

    if (confirmEmail.trim().toLowerCase() !== target.email.toLowerCase())
      validationError(
        "The confirmation email does not match this account. Type it exactly as shown."
      )

    const blockers = await collectBlockers(tx, actorId, target)
    if (blockers.length) conflictError(blockers[0]?.message)

    // Written before the delete: `platform_audit_log.actor_id` survives, but
    // `target_user_id` is nulled by the cascade, so the identity of the deleted
    // account lives in the metadata instead.
    await appendPlatformAudit(tx, {
      actorId,
      targetUserId: null,
      operation: "user_account_deleted",
      metadata: {
        deletedUserId: target.id,
        email: target.email,
        name: target.name,
        accountCreatedAt: target.createdAt.toISOString(),
      },
    })

    const deleted = await deleteUser(tx, targetId)
    if (!deleted) notFoundError("User not found.")

    return { email: deleted.email }
  })
}

/**
 * Everything that must be cleared before an account can be erased. Returned as
 * a list rather than thrown one at a time so the UI can show the whole picture.
 */
async function collectBlockers(
  executor: DatabaseExecutor,
  actorId: string,
  target: AccountSnapshot
): Promise<AccountRemovalBlocker[]> {
  const blockers: AccountRemovalBlocker[] = []

  if (actorId === target.id) {
    blockers.push({
      code: "SELF",
      message: "You cannot delete your own account.",
    })
  }

  const [ownedOrganizations, platformAccess, pendingInvitations] =
    await Promise.all([
      findSoleOwnerOrganizationsForUser(executor, target.id),
      findPlatformAccessForUser(executor, target.id),
      countPendingInvitationsFromUser(executor, target.id),
    ])

  for (const organization of ownedOrganizations) {
    blockers.push({
      code: "SOLE_OWNER",
      message: `${organization.organizationName} has no other owner. Transfer ownership or suspend the workspace before deleting this account.`,
      organizationId: organization.organizationId,
      organizationName: organization.organizationName,
    })
  }

  if (platformAccess[0]?.role === "super_admin") {
    const [{ value } = { value: 0 }] = await countSuperAdmins(executor)
    if (Number(value ?? 0) <= 1) {
      blockers.push({
        code: "LAST_SUPER_ADMIN",
        message:
          "At least one super admin must remain. Promote another super admin first.",
      })
    }
  }

  if (pendingInvitations > 0) {
    blockers.push({
      code: "PENDING_INVITATIONS",
      message: `${pendingInvitations} invitation${
        pendingInvitations === 1 ? "" : "s"
      } sent by this user are still open. Cancel or let them be accepted first.`,
    })
  }

  return blockers
}

async function requireAccount(
  executor: DatabaseExecutor,
  targetId: string
): Promise<AccountSnapshot> {
  const [target] = await findUserForUpdate(executor, targetId)
  if (!target) notFoundError("User not found.")
  return target
}

async function assertSuperAdminActor(
  executor: DatabaseExecutor,
  actorId: string,
  targetId: string
) {
  if (actorId === targetId)
    forbidden("You cannot change your own account state.")
  const actorAccess = await findPlatformAccessForUser(executor, actorId)
  if (actorAccess[0]?.role !== "super_admin")
    forbidden("Only super admins can remove user accounts.")
}

/**
 * Deactivation locks the person out just as thoroughly as losing the role, so
 * it has to respect the same floor as `updatePlatformUserRoleUseCase`.
 */
async function assertNotLastSuperAdmin(
  executor: DatabaseExecutor,
  targetId: string
) {
  const targetAccess = await findPlatformAccessForUser(executor, targetId)
  if (targetAccess[0]?.role !== "super_admin") return
  const [{ value } = { value: 0 }] = await countSuperAdmins(executor)
  if (Number(value ?? 0) <= 1)
    conflictError("At least one super admin must remain.")
}
