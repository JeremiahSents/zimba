import type { Metadata } from "next"

import { SuppliersPage } from "@/components/dashboard/features/suppliers/suppliers-page"
import { getDashboardOverviewData } from "@/lib/zimba/dashboard-data"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Suppliers | Zimba",
  description: "Supplier tracking preview for Zimba construction projects.",
}

export default async function Page() {
  const data = await getDashboardOverviewData()

  return <SuppliersPage data={data} />
}
