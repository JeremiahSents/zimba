import "server-only"

import { requireZimbaApiSession } from "@/lib/api/auth"

import type { DashboardOverviewData } from "@/lib/types"

export async function getDashboardOverviewData(): Promise<DashboardOverviewData> {
  const session = await requireZimbaApiSession()

  const { getProjectsList } = await import("@/core/projects/service")
  const { getSuppliersList } = await import("@/core/suppliers/service")
  const { getDashboardOverview, getExpensesList } = await import("@/core/dashboard/service")

  const projects = await getProjectsList()
  const suppliers = await getSuppliersList()
  const overview = await getDashboardOverview()
  const expenses = await getExpensesList() as any

  return {
    expenses,
    projects,
    source: "api",
    spendChart: overview.spend_by_period.map((period) => ({
      budget: period.budget,
      month: period.period,
      spent: period.spent,
    })),
    suppliers,
    utilizationChart: overview.utilization_by_period.map((period) => ({
      month: period.period,
      utilization: period.utilization_pct,
    })),
  }
}


