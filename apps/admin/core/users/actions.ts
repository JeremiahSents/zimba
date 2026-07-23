"use server"

import { platformRoleUpdateSchema } from "@workspace/contracts"
import { revalidatePath } from "next/cache"
import { ensureActionSession } from "@/core/auth/action-session"
import { requirePlatformRole } from "@/core/auth/service"
import {
  type ActionResult,
  expectedActionFailure,
} from "@/core/shared/action-result"
import { handleActionError } from "@/core/shared/handle-action-error"
import { removePlatformUser, updatePlatformUserRole } from "./service"

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
