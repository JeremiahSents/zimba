import { eq } from "drizzle-orm"
import type { DatabaseExecutor } from "../shared/executor"
import { session, user } from "./schema"

export function findUserById(executor: DatabaseExecutor, userId: string) {
  return executor.select().from(user).where(eq(user.id, userId)).limit(1)
}

/** Row-locked so two admins cannot deactivate and delete the same account. */
export function findUserForUpdate(executor: DatabaseExecutor, userId: string) {
  return executor
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      deactivatedAt: user.deactivatedAt,
      deactivatedBy: user.deactivatedBy,
      deactivationReason: user.deactivationReason,
    })
    .from(user)
    .where(eq(user.id, userId))
    .for("update")
}

/** The same shape as `findUserForUpdate`, without taking the lock. */
export function findAccountSummary(executor: DatabaseExecutor, userId: string) {
  return executor
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      deactivatedAt: user.deactivatedAt,
      deactivatedBy: user.deactivatedBy,
      deactivationReason: user.deactivationReason,
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1)
}

export function findAccountStatus(executor: DatabaseExecutor, userId: string) {
  return executor
    .select({ id: user.id, deactivatedAt: user.deactivatedAt })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1)
}

export function updateUserName(
  executor: DatabaseExecutor,
  userId: string,
  name: string
) {
  return executor
    .update(user)
    .set({ name, updatedAt: new Date() })
    .where(eq(user.id, userId))
}

export function findUserByEmail(executor: DatabaseExecutor, email: string) {
  return executor.select().from(user).where(eq(user.email, email)).limit(1)
}

export async function deactivateUser(
  executor: DatabaseExecutor,
  userId: string,
  data: { deactivatedBy: string; reason: string | null }
) {
  const [updated] = await executor
    .update(user)
    .set({
      deactivatedAt: new Date(),
      deactivatedBy: data.deactivatedBy,
      deactivationReason: data.reason,
      updatedAt: new Date(),
    })
    .where(eq(user.id, userId))
    .returning({ id: user.id, email: user.email })
  return updated ?? null
}

export async function reactivateUser(
  executor: DatabaseExecutor,
  userId: string
) {
  const [updated] = await executor
    .update(user)
    .set({
      deactivatedAt: null,
      deactivatedBy: null,
      deactivationReason: null,
      updatedAt: new Date(),
    })
    .where(eq(user.id, userId))
    .returning({ id: user.id, email: user.email })
  return updated ?? null
}

/**
 * Hard delete. Every remaining reference to the row either cascades (the
 * person's own sessions, accounts, memberships and platform access) or is set
 * to null (the organization data they authored). Callers must clear the
 * ownership blockers first — see `findSoleOwnerOrganizationsForUser`.
 */
export async function deleteUser(executor: DatabaseExecutor, userId: string) {
  const [deleted] = await executor
    .delete(user)
    .where(eq(user.id, userId))
    .returning({ id: user.id, email: user.email })
  return deleted ?? null
}

export function deleteSessionsForUser(
  executor: DatabaseExecutor,
  userId: string
) {
  return executor.delete(session).where(eq(session.userId, userId))
}
