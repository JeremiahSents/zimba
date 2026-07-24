"use server"

import { fieldErrorsFromZod, teamInviteSchema } from "@workspace/contracts"
import { revalidatePath } from "next/cache"
import { ensureActionSession } from "@/core/auth/action-session"
import type { WorkspaceRole } from "@/core/auth/permissions"
import { getWorkspaceSlug } from "@/core/auth/workspace-slug"
import { handleActionError } from "@/core/shared/handle-action-error"
import { createInvitation } from "@/core/team/service"

export async function inviteMemberAction(input: {
  email: string
  role: WorkspaceRole
}) {
  const authFailure = await ensureActionSession("team.invite")
  if (authFailure) return authFailure
  const parsed = teamInviteSchema.safeParse(input)
  if (!parsed.success)
    return {
      success: false as const,
      error: {
        code: "VALIDATION_FAILED" as const,
        message: "Enter a valid email and role.",
        retryable: false,
        recoveryAction: "CORRECT_INPUT" as const,
        fieldErrors: fieldErrorsFromZod(parsed.error),
      },
    }
  try {
    await createInvitation(parsed.data)
    revalidatePath(`/${await getWorkspaceSlug()}/team`)
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
