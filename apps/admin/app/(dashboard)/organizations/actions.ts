"use server"

import { revalidatePath } from "next/cache"
import { ensureActionSession } from "@/core/auth/action-session"
import { updateOrganizationStatus } from "@/core/organizations/service"
import {
  type ActionResult,
  expectedActionFailure,
} from "@/core/shared/action-result"
import { handleActionError } from "@/core/shared/handle-action-error"
import { organizationStatusInputSchema } from "@workspace/contracts"

const statusSchema = organizationStatusInputSchema

export async function updateOrganizationStatusAction(
  organizationId: string,
  status: string
): Promise<ActionResult> {
  const authFailure = await ensureActionSession("organizations.updateStatus")
  if (authFailure) return authFailure

  const parsed = statusSchema.safeParse({ organizationId, status })
  if (!parsed.success) return expectedActionFailure("VALIDATION_FAILED", "Invalid organization status.")

  try {
    const updated = await updateOrganizationStatus(parsed.data.organizationId, parsed.data.status)
    if (!updated) {
      return expectedActionFailure("NOT_FOUND", "Organization not found.")
    }
    revalidatePath("/organizations")
    revalidatePath(`/organizations/${organizationId}`)
    revalidatePath("/overview")
    return { success: true, data: undefined }
  } catch (error) {
    return handleActionError(error, "organizations.updateStatus")
  }
}
