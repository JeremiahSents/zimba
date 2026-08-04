"use server"

import {
  listSuperAdminRecipientsUseCase,
  type OnboardingApplicationDto,
  submitOnboardingApplicationUseCase,
} from "@workspace/api"
import {
  sendApplicationSubmittedEmail,
  sendOnboardingRequestEmail,
} from "@workspace/transactional"

import { getApplicationReviewUrl } from "./admin-review-url"

export type DemoRequestState = {
  status: "idle" | "success" | "error"
  error?: string
  fieldErrors?: {
    fullName?: string
    companyName?: string
    email?: string
  }
  /** Echoed back so a rejected submission does not empty the form. */
  values?: {
    fullName?: string
    companyName?: string
    email?: string
  }
}

/**
 * Public on purpose: this runs from the marketing site for a visitor with no
 * account. Approval is what creates anything — this only records the request
 * and notifies both sides.
 */
export async function requestDemo(
  _previousState: DemoRequestState,
  formData: FormData
): Promise<DemoRequestState> {
  const values = {
    fullName: readField(formData, "fullName"),
    companyName: readField(formData, "companyName"),
    email: readField(formData, "email"),
  }

  let application: OnboardingApplicationDto
  try {
    application = await submitOnboardingApplicationUseCase(values)
  } catch (error) {
    return { ...toDemoRequestState(error), values }
  }

  // Neither notification is allowed to fail the request: the record is already
  // written, and a super admin can still find it in the review queue.
  await Promise.all([
    notifyApplicant(application),
    notifySuperAdmins(application),
  ])

  return { status: "success" }
}

async function notifyApplicant(application: OnboardingApplicationDto) {
  await sendApplicationSubmittedEmail({
    to: application.email,
    fullName: application.fullName,
    companyName: application.companyName,
  }).catch((error) => {
    console.error("Demo request confirmation email failed", error)
  })
}

async function notifySuperAdmins(application: OnboardingApplicationDto) {
  try {
    const superAdmins = await listSuperAdminRecipientsUseCase()
    if (!superAdmins.length) {
      console.error("Demo request has no super admin to notify", application.id)
      return
    }

    const result = await sendOnboardingRequestEmail({
      to: superAdmins.map((admin) => admin.email),
      fullName: application.fullName,
      companyName: application.companyName,
      personalEmail: application.email,
      reviewUrl: getApplicationReviewUrl(application.id),
      submittedAt: application.createdAt,
      companyWebsite: application.companyWebsite,
      industry: application.industry,
      country: application.country,
      phone: application.phone,
      teamSize: application.teamSize,
      useCase: application.useCase,
    })
    if (result.failed.length)
      console.error("Demo request email partially failed", result.failed)
  } catch (error) {
    console.error("Demo request notification failed", error)
  }
}

function readField(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim()
}

function toDemoRequestState(error: unknown): DemoRequestState {
  const fieldErrors = extractFieldErrors(error)
  if (fieldErrors) return { status: "error", fieldErrors }

  console.error("Demo request failed", error)
  return {
    status: "error",
    error:
      error instanceof Error
        ? error.message
        : "We could not send your request. Please try again.",
  }
}

function extractFieldErrors(
  error: unknown
): DemoRequestState["fieldErrors"] | null {
  if (!error || typeof error !== "object") return null
  const raw = (error as { fieldErrors?: Record<string, string[]> }).fieldErrors
  if (!raw) return null
  const fieldErrors: NonNullable<DemoRequestState["fieldErrors"]> = {}
  if (raw.fullName?.length) fieldErrors.fullName = "Enter your full name."
  if (raw.companyName?.length)
    fieldErrors.companyName = "Enter your company name."
  if (raw.email?.length) fieldErrors.email = "Enter a valid email address."
  return Object.keys(fieldErrors).length ? fieldErrors : null
}
