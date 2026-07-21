"use server"

import { revalidatePath } from "next/cache"
import { ensureActionSession } from "@/core/auth/action-session"
import { updateOrganizationStatus } from "@/core/services/organizations"
import {
  type ActionResult,
  expectedActionFailure,
} from "@/core/shared/action-result"
import { handleActionError } from "@/core/shared/handle-action-error"

export async function suspendOrganizationAction(
  organizationId: string
): Promise<ActionResult> {
  const authFailure = await ensureActionSession("organizations.suspend")
  if (authFailure) return authFailure

  try {
    const updated = await updateOrganizationStatus(organizationId, "suspended")
    if (!updated) {
      return expectedActionFailure("NOT_FOUND", "Organization not found.")
    }
    revalidatePath("/organizations")
    revalidatePath(`/organizations/${organizationId}`)
    revalidatePath("/overview")
    return { success: true, data: undefined }
  } catch (error) {
    return handleActionError(error, "organizations.suspend")
  }
}

export async function activateOrganizationAction(
  organizationId: string
): Promise<ActionResult> {
  const authFailure = await ensureActionSession("organizations.activate")
  if (authFailure) return authFailure

  try {
    const updated = await updateOrganizationStatus(organizationId, "active")
    if (!updated) {
      return expectedActionFailure("NOT_FOUND", "Organization not found.")
    }
    revalidatePath("/organizations")
    revalidatePath(`/organizations/${organizationId}`)
    revalidatePath("/overview")
    return { success: true, data: undefined }
  } catch (error) {
    return handleActionError(error, "organizations.activate")
  }
}
