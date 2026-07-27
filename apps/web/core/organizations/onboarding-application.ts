import "server-only"

import { getOnboardingApplicationForUserUseCase } from "@workspace/api"
import type { OnboardingApplicationDto } from "@workspace/contracts"

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
