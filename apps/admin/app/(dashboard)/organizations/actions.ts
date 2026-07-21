"use server"

import { revalidatePath } from "next/cache"
import { ensureActionSession } from "@/core/auth/action-session"
import { updateOrganizationStatus } from "@/core/services/organizations"
import {
  type ActionResult,
  expectedActionFailure,
} from "@/core/shared/action-result"
import { handleActionError } from "@/core/shared/handle-action-error"

const VALID_STATUSES = ["active", "trial", "suspended"]

export async function updateOrganizationStatusAction(
  organizationId: string,
  status: string
): Promise<ActionResult> {
  const authFailure = await ensureActionSession("organizations.updateStatus")
  if (authFailure) return authFailure

  if (!VALID_STATUSES.includes(status)) {
    return expectedActionFailure(
      "VALIDATION_FAILED",
      `Status must be one of: ${VALID_STATUSES.join(", ")}`
    )
  }

  try {
    const updated = await updateOrganizationStatus(organizationId, status)
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
