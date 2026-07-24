"use server"

import { submitOnboardingApplicationUseCase } from "@workspace/api"
import { apiDatabase } from "@workspace/api-runtime"
import { sendApplicationSubmittedEmail } from "@workspace/transactional"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/core/auth/auth"
import { getOrganizationMembership } from "./service"

export type OnboardingState = {
  error?: string
  fieldErrors?: { companyName?: string; fullName?: string }
}

export async function completeOnboarding(
  _previousState: OnboardingState,
  formData: FormData
): Promise<OnboardingState> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")
  const fullName = String(formData.get("fullName") ?? "").trim()
  const companyName = String(formData.get("companyName") ?? "").trim()
  const companyWebsite = String(formData.get("companyWebsite") ?? "").trim()
  const industry = String(formData.get("industry") ?? "").trim()
  const country = String(formData.get("country") ?? "").trim()
  const phone = String(formData.get("phone") ?? "").trim()
  const teamSize = String(formData.get("teamSize") ?? "").trim()
  const useCase = String(formData.get("useCase") ?? "").trim()
  const fieldErrors: OnboardingState["fieldErrors"] = {}
  if (fullName.length < 2 || fullName.length > 100)
    fieldErrors.fullName = "Enter your full name."
  if (companyName.length < 2 || companyName.length > 120)
    fieldErrors.companyName = "Enter your company name."
  if (Object.keys(fieldErrors).length) return { fieldErrors }
  const existing = await getOrganizationMembership(session.user.id)
  if (existing) redirect(`/${existing.slug}/home`)
  try {
    await submitOnboardingApplicationUseCase(
      { userId: session.user.id },
      apiDatabase,
      {
        fullName,
        email: session.user.email,
        companyName,
        companyWebsite: companyWebsite || undefined,
        industry: industry || undefined,
        country: country || undefined,
        phone: phone || undefined,
        teamSize: teamSize || undefined,
        useCase: useCase || undefined,
      }
    )
    await sendApplicationSubmittedEmail({
      to: session.user.email,
      fullName,
      companyName,
    }).catch((error) => {
      console.error("Onboarding welcome email failed", error)
    })
  } catch (error) {
    console.error("Onboarding application failed", error)
    return {
      error:
        error instanceof Error
          ? error.message
          : "We could not submit your application. Please try again.",
    }
  }
  redirect("/pending-approval?submitted=1")
}
