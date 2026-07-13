import type { Metadata } from "next"

import { BudgetPage } from "@/components/budget/budget-page"
import { getDashboardOverviewData } from "@/lib/api/dashboard"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Budget | Zimba",
  description: "Set and monitor overall and project budgets in Zimba.",
}

export default async function Page() {
  const data = await getDashboardOverviewData()

  return <BudgetPage data={data} />
}
