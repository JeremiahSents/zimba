import "server-only"

import type { OnboardingApplicationDto } from "@workspace/api"
import { getOnboardingApplicationByEmailUseCase } from "@workspace/api"

/**
 * Keyed by email because a demo request is submitted from the marketing site
 * before the applicant has an account.
 */
export async function getOnboardingApplicationForEmail(
  email: string
): Promise<OnboardingApplicationDto | null> {
  try {
    return await getOnboardingApplicationByEmailUseCase(email)
  } catch (error) {
    console.error("Could not load onboarding application.", error)
    return null
  }
}
