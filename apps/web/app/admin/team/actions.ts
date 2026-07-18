"use server"

import { revalidatePath } from "next/cache"
import { createInvitation } from "@/core/team/service"
import { ApplicationError } from "@/core/shared/errors"
import type { WorkspaceRole } from "@/core/auth/permissions"
import { requireSession } from "@/core/auth/service"

export async function inviteMemberAction(input: { name: string; email: string; role: WorkspaceRole; responsibility?: string }) {
  await requireSession()
  try {
    const token = await createInvitation(input)
    revalidatePath("/admin/team")
    return { success: true as const, data: { path: `/invite/${token}` } }
  } catch (error) {
    return { success: false as const, error: { message: error instanceof ApplicationError ? error.message : "Could not create invitation." } }
  }
}
