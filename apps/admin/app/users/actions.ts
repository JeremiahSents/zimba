"use server"

import { revalidatePath } from "next/cache"
import { ensureActionSession } from "@/core/auth/action-session"
import {
  type ActionResult,
  expectedActionFailure,
} from "@/core/shared/action-result"
import { handleActionError } from "@/core/shared/handle-action-error"
import {
  updatePlatformUserRole,
  removePlatformUser,
} from "@/core/services/users"

const VALID_ROLES = ["super_admin", "support", "none"]

export async function updatePlatformUserRoleAction(
  userId: string,
  role: string
): Promise<ActionResult> {
  const authFailure = await ensureActionSession("users.updateRole")
  if (authFailure) return authFailure

  if (!VALID_ROLES.includes(role)) {
    return expectedActionFailure(
      "VALIDATION_FAILED",
      `Role must be one of: ${VALID_ROLES.join(", ")}`
    )
  }

  try {
    if (role === "none") {
      await removePlatformUser(userId)
    } else {
      await updatePlatformUserRole(userId, role)
    }
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
  const authFailure = await ensureActionSession("users.removePlatform")
  if (authFailure) return authFailure

  try {
    await removePlatformUser(userId)
    revalidatePath("/users")
    revalidatePath(`/users/${userId}`)
    return { success: true, data: undefined }
  } catch (error) {
    return handleActionError(error, "users.removePlatform")
  }
}
