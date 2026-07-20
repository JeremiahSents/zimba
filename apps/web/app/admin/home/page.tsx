import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { DashboardPage } from "@/components/dashboard/overview-page"
import { getSessionWithOrganization } from "@/core/auth/service"
import { getDashboardOverviewData } from "@/core/dashboard/service"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Dashboard | Zimba",
  description: "Dashboard for Zimba construction expense tracking.",
}

export default async function Page() {
  const session = await getSessionWithOrganization()
  if (!session) redirect("/login")
  if (!session.organization) redirect("/onboarding")

  const data = await getDashboardOverviewData()

  return <DashboardPage data={data} />
}
