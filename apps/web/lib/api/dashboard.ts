import "server-only"

import { requireZimbaApiSession } from "@/lib/api/auth"
import {
  getDashboardOverview,
  listExpenses,
  listProjects,
  listSuppliers,
  ZimbaApiError,
} from "@/lib/api/client"
import {
  toExpenseTableRow,
  toProjectSummary,
  toSupplier,
} from "@/lib/api/normalizers"
import type { DashboardOverviewData } from "@/lib/types"

export async function getDashboardOverviewData(): Promise<DashboardOverviewData> {
  const session = await requireZimbaApiSession()

  const workspaceData = await Promise.all([
    getDashboardOverview(session),
    listProjects(session, { page: 1, page_size: 100 }),
    listExpenses(session, {
      page: 1,
      page_size: 100,
      sort_by: "expense_date",
      sort_order: "desc",
    }),
    listSuppliers(session, { page: 1, page_size: 100 }),
  ]).catch((error: unknown) => {
    if (error instanceof ZimbaApiError && error.status === 500) {
      console.error(
        "The Zimba API could not load the workspace; showing an empty workspace.",
        error
      )
      return null
    }

    throw error
  })

  if (!workspaceData) return getEmptyDashboardData()

  const [overview, projectPage, expensePage, apiSuppliers] = workspaceData

  const projects = projectPage.items.map(toProjectSummary)
  const expenses = expensePage.items.map(toExpenseTableRow)
  const suppliers = apiSuppliers.map(toSupplier)

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

function getEmptyDashboardData(): DashboardOverviewData {
  return {
    expenses: [],
    projects: [],
    source: "api",
    spendChart: [],
    suppliers: [],
    utilizationChart: [],
  }
}
