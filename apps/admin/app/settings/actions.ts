"use server"

import { revalidatePath } from "next/cache"
import { ensureActionSession } from "@/core/auth/action-session"
import { sendSuperAdminInvite } from "@/core/services/super-admin-invite"
import {
  type ActionResult,
  expectedActionFailure,
} from "@/core/shared/action-result"
import { handleActionError } from "@/core/shared/handle-action-error"

export async function sendSuperAdminInviteAction(input: {
  email: string
  name: string
}): Promise<ActionResult> {
  const authFailure = await ensureActionSession("settings.inviteSuperAdmin")
  if (authFailure) return authFailure

  if (!input.email.includes("@") || !input.name.trim()) {
    return expectedActionFailure(
      "VALIDATION_FAILED",
      "Enter a name and valid email address."
    )
  }

  try {
    await sendSuperAdminInvite(input)
    revalidatePath("/settings")
    return { success: true, data: undefined }
  } catch (error) {
    return handleActionError(error, "settings.inviteSuperAdmin")
  }
}
