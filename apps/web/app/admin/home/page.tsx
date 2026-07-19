import type { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { DashboardPage } from "@/components/dashboard/overview-page"
import { auth } from "@/core/auth/auth"
import { getOrganizationMembership } from "@/core/organizations/service"
import { getDashboardOverviewData } from "@/core/dashboard/service"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Dashboard | Zimba",
  description: "Dashboard for Zimba construction expense tracking.",
}

export default async function Page() {
  // Layouts and pages can render concurrently, so guard this data boundary too.
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")
  const membership = await getOrganizationMembership(session.user.id)
  if (!membership) redirect("/onboarding")

  const data = await getDashboardOverviewData()

  return <DashboardPage data={data} />
}
