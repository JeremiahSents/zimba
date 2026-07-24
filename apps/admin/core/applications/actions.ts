"use server"

import {
  approveOnboardingApplicationUseCase,
  getOnboardingApplicationDetailUseCase,
  rejectOnboardingApplicationUseCase,
} from "@workspace/api"
import { apiDatabase } from "@workspace/api-runtime"
import {
  sendApplicationApprovedEmail,
  sendApplicationRejectedEmail,
} from "@workspace/transactional"
import { revalidatePath } from "next/cache"
import { requirePlatformSession } from "@/core/auth/service"

function getAppUrl() {
  return (
    process.env.APP_URL ??
    process.env.BETTER_AUTH_URL ??
    "http://localhost:3000"
  )
}

export async function approveApplication(formData: FormData) {
  const session = await requirePlatformSession()
  const applicationId = String(formData.get("applicationId") ?? "")
  if (!applicationId) return

  const application = await getOnboardingApplicationDetailUseCase(
    apiDatabase,
    applicationId
  )
  const result = await approveOnboardingApplicationUseCase(
    { reviewerId: session.user.id },
    apiDatabase,
    applicationId
  )
  if (application?.email) {
    await sendApplicationApprovedEmail({
      to: application.email,
      fullName: application.fullName,
      companyName: application.companyName,
      loginUrl: `${getAppUrl()}/${result.slug}/home`,
    }).catch((error) => {
      console.error("Application approval email failed", error)
    })
  }

  revalidatePath("/applications")
  revalidatePath(`/applications/${applicationId}`)
  revalidatePath("/overview")
}

export async function rejectApplication(formData: FormData) {
  const session = await requirePlatformSession()
  const applicationId = String(formData.get("applicationId") ?? "")
  const rejectionReason = String(formData.get("rejectionReason") ?? "").trim()
  if (!applicationId) return

  const application = await getOnboardingApplicationDetailUseCase(
    apiDatabase,
    applicationId
  )
  await rejectOnboardingApplicationUseCase(
    { reviewerId: session.user.id },
    apiDatabase,
    applicationId,
    rejectionReason || undefined
  )
  if (application?.email) {
    await sendApplicationRejectedEmail({
      to: application.email,
      fullName: application.fullName,
      companyName: application.companyName,
      rejectionReason: rejectionReason || undefined,
      onboardingUrl: `${getAppUrl()}/onboarding`,
    }).catch((error) => {
      console.error("Application rejection email failed", error)
    })
  }

  revalidatePath("/applications")
  revalidatePath(`/applications/${applicationId}`)
  revalidatePath("/overview")
}
