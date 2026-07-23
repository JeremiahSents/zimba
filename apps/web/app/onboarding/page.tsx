import type { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { OnboardingForm } from "@/components/auth/onboarding-form"
import { auth } from "@/core/auth/auth"
import { getOrganizationMembership } from "@/core/organizations/service"

export const metadata: Metadata = {
  title: "Set up your workspace | Zimba",
  description: "Create your Zimba company workspace.",
}

export default async function OnboardingPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")

  const membership = await getOrganizationMembership(session.user.id)
  if (membership) redirect(`/${membership.slug}/home`)

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <OnboardingForm
          defaultName={session.user.name}
          email={session.user.email}
        />
      </div>
    </div>
  )
}
