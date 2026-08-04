import type { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { OnboardingForm } from "@/components/auth/onboarding-form"
import { auth } from "@/core/auth/auth"
import { getOnboardingApplicationForUser } from "@/core/organizations/onboarding-application"
import { getOrganizationMembership } from "@/core/organizations/service"

export const metadata: Metadata = {
  title: "Book a demo | Zimba",
  description: "Request a Zimba demo for your company.",
}

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{
    reapply?: string
    fullName?: string
    companyName?: string
    email?: string
  }>
}) {
  const { reapply, fullName, companyName, email } = await searchParams
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    // Keep landing-page prefill (fullName/companyName/email) across sign-in.
    const prefill = new URLSearchParams()
    if (fullName) prefill.set("fullName", fullName)
    if (companyName) prefill.set("companyName", companyName)
    if (email) prefill.set("email", email)
    const query = prefill.toString()
    const target = query ? `/onboarding?${query}` : "/onboarding"
    redirect(`/login?callbackUrl=${encodeURIComponent(target)}`)
  }

  const membership = await getOrganizationMembership(session.user.id)
  if (membership) redirect(`/${membership.slug}/home`)

  const application = await getOnboardingApplicationForUser(session.user.id)
  if (application && application.status === "pending")
    redirect("/pending-approval")
  if (application && application.status === "rejected" && reapply !== "1")
    redirect("/pending-approval")

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <OnboardingForm
          defaultName={fullName?.trim() || session.user.name}
          defaultCompany={companyName?.trim() ?? ""}
          email={email?.trim() || session.user.email}
        />
      </div>
    </div>
  )
}
