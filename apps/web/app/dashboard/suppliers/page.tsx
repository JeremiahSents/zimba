import type { Metadata } from "next"

import { SuppliersPage } from "@/components/dashboard/dashboard-section-pages"

export const metadata: Metadata = {
  title: "Suppliers | Zimba",
  description: "Supplier tracking preview for Zimba construction projects.",
}

export default function Page() {
  return <SuppliersPage />
}
