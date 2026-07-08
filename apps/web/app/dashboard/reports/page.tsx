import type { Metadata } from "next"

import { ReportsPage } from "@/components/dashboard/dashboard-section-pages"

export const metadata: Metadata = {
  title: "Reports | Zimba",
  description: "Reporting preview for Zimba construction project tracking.",
}

export default function Page() {
  return <ReportsPage />
}
