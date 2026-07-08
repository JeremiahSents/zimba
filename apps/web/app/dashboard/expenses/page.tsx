import type { Metadata } from "next"

import { ExpensesPage } from "@/components/dashboard/dashboard-section-pages"

export const metadata: Metadata = {
  title: "Expenses | Zimba",
  description: "Expense tracking preview for Zimba construction projects.",
}

export default function Page() {
  return <ExpensesPage />
}
