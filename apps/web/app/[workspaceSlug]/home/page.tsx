import type { Metadata } from "next"

import { DashboardPage } from "@/components/dashboard/overview-page"
import { getDashboardOverviewData } from "@/core/dashboard/service"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Dashboard | Zimba",
  description: "Dashboard for Zimba construction expense tracking.",
}

export default async function Page() {
  const data = await getDashboardOverviewData()
  return <DashboardPage data={data} />
}
