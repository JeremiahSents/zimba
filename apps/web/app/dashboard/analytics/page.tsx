import type { Metadata } from "next"

import { AnalyticsPage } from "@/components/dashboard/features/analytics/analytics-page"
import { getDashboardOverviewData } from "@/lib/zimba/dashboard-data"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Analytics | Zimba",
  description: "Portfolio spending and budget analytics for Zimba projects.",
}

export default async function Page() {
  const data = await getDashboardOverviewData()

  return <AnalyticsPage data={data} />
}
