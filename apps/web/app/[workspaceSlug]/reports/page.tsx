import { BoneCapture } from "@workspace/ui/components/bones"
import type { Metadata } from "next"

import { ReportsPage } from "@/components/reports/reports-page"
import { getDashboardOverviewData } from "@/core/dashboard/service"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Reports | Zimba",
  description: "Reporting preview for Zimba construction project tracking.",
}

export default async function Page() {
  const data = await getDashboardOverviewData()
  return (
    <BoneCapture name="web-reports">
      <ReportsPage data={data} />
    </BoneCapture>
  )
}
