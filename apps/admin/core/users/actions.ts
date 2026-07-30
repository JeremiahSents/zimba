"use server"

import {
  accountDeactivationSchema,
  accountDeletionSchema,
  platformRoleUpdateSchema,
} from "@workspace/api"
import { revalidatePath } from "next/cache"
import { ensureActionSession } from "@/core/auth/action-session"
import { requirePlatformRole } from "@/core/auth/service"
import {
  type ActionResult,
  expectedActionFailure,
} from "@/core/shared/action-result"
import { handleActionError } from "@/core/shared/handle-action-error"
import {
  deactivateUserAccount,
  deleteUserAccount,
  reactivateUserAccount,
  removePlatformUser,
  updatePlatformUserRole,
} from "./service"

export async function updatePlatformUserRoleAction(
  userId: string,
  role: string
): Promise<ActionResult> {
  const authFailure = await ensureActionSession("users.updateRole", [
    "super_admin",
  ])
  if (authFailure) return authFailure
  const parsed = platformRoleUpdateSchema.safeParse({ userId, role })
  if (!parsed.success)
    return expectedActionFailure(
      "VALIDATION_FAILED",
      "Invalid platform role or user."
    )
  try {
    const actor = await requirePlatformRole(["super_admin"])
    if (role === "none") await removePlatformUser(actor.user.id, userId)
    else
      await updatePlatformUserRole(
        actor.user.id,
        userId,
        role as "support" | "super_admin"
      )
    revalidatePath("/users")
    revalidatePath(`/users/${userId}`)
    return { success: true, data: undefined }
  } catch (error) {
    return handleActionError(error, "users.updateRole")
  }
}

export async function removePlatformUserAction(
  userId: string
): Promise<ActionResult> {
  const authFailure = await ensureActionSession("users.removePlatform", [
    "super_admin",
  ])
  if (authFailure) return authFailure
  try {
    const actor = await requirePlatformRole(["super_admin"])
    await removePlatformUser(actor.user.id, userId)
    revalidatePath("/users")
    revalidatePath(`/users/${userId}`)
    return { success: true, data: undefined }
  } catch (error) {
    return handleActionError(error, "users.removePlatform")
  }
}

/**
 * The reversible half of account removal: the row survives, so nothing the
 * person authored loses its author, and reactivating undoes it completely.
 */
export async function deactivateUserAccountAction(
  userId: string,
  reason?: string
): Promise<ActionResult> {
  const authFailure = await ensureActionSession("users.deactivateAccount", [
    "super_admin",
  ])
  if (authFailure) return authFailure
  const parsed = accountDeactivationSchema.safeParse({
    userId,
    reason: reason ?? "",
  })
  if (!parsed.success)
    return expectedActionFailure(
      "VALIDATION_FAILED",
      "Check the user and reason, then try again."
    )
  try {
    const actor = await requirePlatformRole(["super_admin"])
    await deactivateUserAccount(
      actor.user.id,
      parsed.data.userId,
      parsed.data.reason || undefined
    )
    revalidateUserViews(userId)
    return { success: true, data: undefined }
  } catch (error) {
    return handleActionError(error, "users.deactivateAccount")
  }
}

export async function reactivateUserAccountAction(
  userId: string
): Promise<ActionResult> {
  const authFailure = await ensureActionSession("users.reactivateAccount", [
    "super_admin",
  ])
  if (authFailure) return authFailure
  try {
    const actor = await requirePlatformRole(["super_admin"])
    await reactivateUserAccount(actor.user.id, userId)
    revalidateUserViews(userId)
    return { success: true, data: undefined }
  } catch (error) {
    return handleActionError(error, "users.reactivateAccount")
  }
}

/**
 * Irreversible. `confirmEmail` is retyped by the admin and checked against the
 * account inside the use case, so this cannot fire on the wrong row.
 */
export async function deleteUserAccountAction(
  userId: string,
  confirmEmail: string
): Promise<ActionResult> {
  const authFailure = await ensureActionSession("users.deleteAccount", [
    "super_admin",
  ])
  if (authFailure) return authFailure
  const parsed = accountDeletionSchema.safeParse({ userId, confirmEmail })
  if (!parsed.success)
    return expectedActionFailure(
      "VALIDATION_FAILED",
      "Type the account's email address exactly as shown to confirm."
    )
  try {
    const actor = await requirePlatformRole(["super_admin"])
    await deleteUserAccount(
      actor.user.id,
      parsed.data.userId,
      parsed.data.confirmEmail
    )
    revalidateUserViews(userId)
    return { success: true, data: undefined }
  } catch (error) {
    return handleActionError(error, "users.deleteAccount")
  }
}

function revalidateUserViews(userId: string) {
  revalidatePath("/users")
  revalidatePath(`/users/${userId}`)
  revalidatePath("/overview")
  revalidatePath("/activity")
}
