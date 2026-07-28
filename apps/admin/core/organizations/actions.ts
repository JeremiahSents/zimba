"use server"

import {
  grantWorkspaceAccessUseCase,
  organizationStatusInputSchema,
} from "@workspace/api"
import { revalidatePath } from "next/cache"
import { getCustomerAppUrl } from "@/core/applications/customer-app-url"
import { ensureActionSession } from "@/core/auth/action-session"
import { getPlatformSession } from "@/core/auth/service"
import {
  type ActionResult,
  expectedActionFailure,
} from "@/core/shared/action-result"
import { handleActionError } from "@/core/shared/handle-action-error"
import { updateOrganizationStatus } from "./service"

export async function updateOrganizationStatusAction(
  organizationId: string,
  status: string
): Promise<ActionResult> {
  const authFailure = await ensureActionSession("organizations.updateStatus")
  if (authFailure) return authFailure
  const parsed = organizationStatusInputSchema.safeParse({
    organizationId,
    status,
  })
  if (!parsed.success)
    return expectedActionFailure(
      "VALIDATION_FAILED",
      "Invalid organization status."
    )
  try {
    const updated = await updateOrganizationStatus(
      parsed.data.organizationId,
      parsed.data.status
    )
    if (!updated)
      return expectedActionFailure("NOT_FOUND", "Organization not found.")
    revalidatePath("/organizations")
    revalidatePath(`/organizations/${organizationId}`)
    revalidatePath("/overview")
    return { success: true, data: undefined }
  } catch (error) {
    return handleActionError(error, "organizations.updateStatus")
  }
}

async function setOrganizationStatus(
  organizationId: string,
  status: "active" | "suspended",
  operation: string
): Promise<ActionResult> {
  const authFailure = await ensureActionSession(operation)
  if (authFailure) return authFailure
  try {
    const updated = await updateOrganizationStatus(organizationId, status)
    if (!updated)
      return expectedActionFailure("NOT_FOUND", "Organization not found.")
    revalidatePath("/organizations")
    revalidatePath(`/organizations/${organizationId}`)
    revalidatePath("/overview")
    return { success: true, data: undefined }
  } catch (error) {
    return handleActionError(error, operation)
  }
}

export async function suspendOrganizationAction(
  id: string
): Promise<ActionResult> {
  return setOrganizationStatus(id, "suspended", "organizations.suspend")
}

export async function activateOrganizationAction(
  id: string
): Promise<ActionResult> {
  return setOrganizationStatus(id, "active", "organizations.activate")
}

export async function visitOrganizationAction(
  organizationId: string
): Promise<ActionResult<{ url: string; expiresAt: Date }>> {
  const authFailure = await ensureActionSession("organizations.visit", [
    "super_admin",
  ])
  if (authFailure) return authFailure

  try {
    const session = await getPlatformSession()
    if (!session?.user) {
      return expectedActionFailure("UNAUTHENTICATED", "Sign in to continue.")
    }

    const { slug, expiresAt } = await grantWorkspaceAccessUseCase({
      actorId: session.user.id,
      organizationId,
    })

    // Nothing secret in this URL: the grant row is the authorization, and it
    // is bound to the actor, this organization, and a 30-minute window.
    const url = `${getCustomerAppUrl()}/${slug}`
    return { success: true, data: { url, expiresAt } }
  } catch (error) {
    return handleActionError(error, "organizations.visit")
  }
}
