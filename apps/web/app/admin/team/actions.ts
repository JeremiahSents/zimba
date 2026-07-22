"use server"

import { revalidatePath } from "next/cache"
import { ensureActionSession } from "@/core/auth/action-session"
import type { WorkspaceRole } from "@/core/auth/permissions"
import { handleActionError } from "@/core/shared/handle-action-error"
import { createInvitation } from "@/core/team/service"
import { z } from "zod"
import { fieldErrorsFromZod } from "@workspace/server-primitives"
import { emailSchema, workspaceRoleSchema } from "@/core/shared/validation"

export async function inviteMemberAction(input: {
  email: string
  role: WorkspaceRole
}) {
  const authFailure = await ensureActionSession("team.invite")
  if (authFailure) return authFailure
  const parsed = z.object({ email: emailSchema, role: workspaceRoleSchema }).safeParse(input)
  if (!parsed.success) return { success: false as const, error: { code: "VALIDATION_FAILED" as const, message: "Enter a valid email and role.", retryable: false, recoveryAction: "CORRECT_INPUT" as const, fieldErrors: fieldErrorsFromZod(parsed.error) } }
  try {
    await createInvitation(parsed.data)
    revalidatePath("/admin/team")
    return {
      success: true as const,
      data: {
        message:
          "Invitation email sent. The invitee will receive a link to join your workspace.",
      },
    }
  } catch (error) {
    return handleActionError(error, "team.invite")
  }
}
