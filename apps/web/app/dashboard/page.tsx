import type { Metadata } from "next"

import { DashboardPage } from "@/components/dashboard"

export const metadata: Metadata = {
  title: "Dashboard | Zimba",
  description: "Static dashboard preview for Zimba construction expense tracking.",
}

export default function Page() {
  return <DashboardPage />
}
