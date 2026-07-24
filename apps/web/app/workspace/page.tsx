import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/core/auth/auth"
import { getOnboardingApplicationForUser } from "@/core/organizations/onboarding-application"
import { getOrganizationMembership } from "@/core/organizations/service"

export const dynamic = "force-dynamic"

export default async function WorkspaceEntryPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login?callbackUrl=/workspace")

  const membership = await getOrganizationMembership(session.user.id)
  if (membership) redirect(`/${membership.slug}/home`)

  const application = await getOnboardingApplicationForUser(session.user.id)
  if (
    application &&
    (application.status === "pending" || application.status === "rejected")
  )
    redirect("/pending-approval")

  redirect("/onboarding")
}
