"use server"

import { revalidatePath } from "next/cache"
import { ensureActionSession } from "@/core/auth/action-session"
import { sendSuperAdminInvite } from "@/core/users/invite"
import {
  type ActionResult,
  expectedActionFailure,
} from "@/core/shared/action-result"
import { handleActionError } from "@/core/shared/handle-action-error"
import { z } from "zod"
import { adminInviteSchema } from "@/core/shared/validation"

const inviteSchema = adminInviteSchema
export async function sendSuperAdminInviteAction(input: {
  email: string
  name: string
}): Promise<ActionResult> {
  const authFailure = await ensureActionSession("settings.inviteSuperAdmin")
  if (authFailure) return authFailure

  const parsed = inviteSchema.safeParse(input)
  if (!parsed.success) return expectedActionFailure("VALIDATION_FAILED", "Enter a name and valid email address.")

  try {
    await sendSuperAdminInvite(parsed.data)
    revalidatePath("/settings")
    return { success: true, data: undefined }
  } catch (error) {
    return handleActionError(error, "settings.inviteSuperAdmin")
  }
}
