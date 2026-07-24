"use server"

import {
  approveOnboardingApplicationUseCase,
  getOnboardingApplicationDetailUseCase,
  recordPlatformAuditUseCase,
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

  await recordPlatformAuditUseCase(apiDatabase, {
    actorId: session.user.id,
    targetUserId: application?.userId ?? null,
    operation: "onboarding_application_approved",
    metadata: {
      applicationId,
      companyName: application?.companyName ?? null,
      slug: result.slug,
    },
  }).catch((error: unknown) => {
    console.error("Audit log failed", error)
  })

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

  await recordPlatformAuditUseCase(apiDatabase, {
    actorId: session.user.id,
    targetUserId: application?.userId ?? null,
    operation: "onboarding_application_rejected",
    metadata: {
      applicationId,
      companyName: application?.companyName ?? null,
      rejectionReason: rejectionReason || null,
    },
  }).catch((error: unknown) => {
    console.error("Audit log failed", error)
  })

  revalidatePath("/applications")
  revalidatePath(`/applications/${applicationId}`)
  revalidatePath("/overview")
}
