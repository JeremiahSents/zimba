import type { Metadata } from "next"

import { ExpensesPage } from "@/components/expenses/expenses-page"
import { getDashboardOverviewData } from "@/lib/api/dashboard"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Expenses | Zimba",
  description: "Expense tracking preview for Zimba construction projects.",
}

export default async function Page() {
  const data = await getDashboardOverviewData()

  return <ExpensesPage data={data} />
}
