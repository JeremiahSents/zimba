"use server"

import { revalidatePath } from "next/cache"
import { ensureActionSession } from "@/core/auth/action-session"
import type { WorkspaceRole } from "@/core/auth/permissions"
import { handleActionError } from "@/core/shared/handle-action-error"
import { createInvitation } from "@/core/team/service"

export async function inviteMemberAction(input: {
  name: string
  email: string
  role: WorkspaceRole
  responsibility?: string
}) {
  const authFailure = await ensureActionSession("team.invite")
  if (authFailure) return authFailure
  try {
    await createInvitation(input)
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
