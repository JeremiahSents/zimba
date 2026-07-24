"use server"

import { completeOnboardingUseCase } from "@workspace/api"
import { apiDatabase } from "@workspace/api-runtime"
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
  const fieldErrors: OnboardingState["fieldErrors"] = {}
  if (fullName.length < 2 || fullName.length > 100)
    fieldErrors.fullName = "Enter your full name."
  if (companyName.length < 2 || companyName.length > 120)
    fieldErrors.companyName = "Enter your company name."
  if (Object.keys(fieldErrors).length) return { fieldErrors }
  const existing = await getOrganizationMembership(session.user.id)
  if (existing) redirect(`/${existing.slug}/home`)
  try {
    await completeOnboardingUseCase({ userId: session.user.id }, apiDatabase, {
      fullName,
      companyName,
    })
  } catch (error) {
    console.error("Organization onboarding failed", error)
    return {
      error: "We could not create your company workspace. Please try again.",
    }
  }
  const membership = await getOrganizationMembership(session.user.id)
  redirect(`/${membership?.slug ?? "workspace"}/home`)
}
