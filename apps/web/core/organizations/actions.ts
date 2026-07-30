"use server"

import {
  listSuperAdminRecipientsUseCase,
  type OnboardingApplicationDto,
  recordPlatformAuditUseCase,
  submitOnboardingApplicationUseCase,
} from "@workspace/api"
import {
  sendApplicationSubmittedEmail,
  sendOnboardingRequestEmail,
} from "@workspace/transactional"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/core/auth/auth"
import { getApplicationReviewUrl } from "./admin-review-url"
import { getOrganizationMembership } from "./service"

export type OnboardingState = {
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

export async function completeOnboarding(
  _previousState: OnboardingState,
  formData: FormData
): Promise<OnboardingState> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")

  const values = {
    fullName: readField(formData, "fullName"),
    companyName: readField(formData, "companyName"),
    email: readField(formData, "email") || session.user.email,
  }

  const existing = await getOrganizationMembership(session.user.id)
  if (existing) redirect(`/${existing.slug}/home`)

  let application: OnboardingApplicationDto
  try {
    application = await submitOnboardingApplicationUseCase(
      { userId: session.user.id },
      {
        ...values,
        companyWebsite: readField(formData, "companyWebsite"),
        industry: readField(formData, "industry"),
        country: readField(formData, "country"),
        phone: readField(formData, "phone"),
        teamSize: readField(formData, "teamSize"),
        useCase: readField(formData, "useCase"),
      }
    )
  } catch (error) {
    return { ...toOnboardingState(error), values }
  }

  // Neither notification is allowed to fail the request: the record is already
  // written, and a super admin can still find it in the review queue.
  await Promise.all([
    notifyApplicant(application),
    notifySuperAdmins(application),
  ])

  await recordPlatformAuditUseCase({
    actorId: session.user.id,
    targetUserId: session.user.id,
    operation: "onboarding_application_submitted",
    metadata: {
      applicationId: application.id,
      companyName: application.companyName,
      email: application.email,
    },
  }).catch((error: unknown) => {
    console.error("Audit log failed", error)
  })

  redirect("/pending-approval?submitted=1")
}

async function notifyApplicant(application: OnboardingApplicationDto) {
  await sendApplicationSubmittedEmail({
    to: application.email,
    fullName: application.fullName,
    companyName: application.companyName,
  }).catch((error) => {
    console.error("Onboarding welcome email failed", error)
  })
}

async function notifySuperAdmins(application: OnboardingApplicationDto) {
  try {
    const superAdmins = await listSuperAdminRecipientsUseCase()
    if (!superAdmins.length) {
      console.error(
        "Onboarding request has no super admin to notify",
        application.id
      )
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
      console.error("Onboarding request email partially failed", result.failed)
  } catch (error) {
    console.error("Onboarding request notification failed", error)
  }
}

function readField(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim()
}

/**
 * The use case validates with the same Zod schema the form is built from, so
 * its field errors can be shown against the inputs that produced them.
 */
function toOnboardingState(error: unknown): OnboardingState {
  const fieldErrors = extractFieldErrors(error)
  if (fieldErrors) return { fieldErrors }

  console.error("Onboarding request failed", error)
  return {
    error:
      error instanceof Error
        ? error.message
        : "We could not send your request. Please try again.",
  }
}

function extractFieldErrors(
  error: unknown
): OnboardingState["fieldErrors"] | null {
  if (!error || typeof error !== "object") return null
  const raw = (error as { fieldErrors?: Record<string, string[]> }).fieldErrors
  if (!raw) return null
  const fieldErrors: NonNullable<OnboardingState["fieldErrors"]> = {}
  if (raw.fullName?.length) fieldErrors.fullName = "Enter your full name."
  if (raw.companyName?.length)
    fieldErrors.companyName = "Enter your company name."
  if (raw.email?.length) fieldErrors.email = "Enter a valid email address."
  return Object.keys(fieldErrors).length ? fieldErrors : null
}
