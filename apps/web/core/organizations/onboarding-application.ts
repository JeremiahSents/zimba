import "server-only"

import type { OnboardingApplicationDto } from "@workspace/api"
import { getOnboardingApplicationForUserUseCase } from "@workspace/api"

export async function getOnboardingApplicationForUser(
  userId: string
): Promise<OnboardingApplicationDto | null> {
  try {
    return await getOnboardingApplicationForUserUseCase(userId)
  } catch (error) {
    console.error("Could not load onboarding application.", error)
    return null
  }
}
