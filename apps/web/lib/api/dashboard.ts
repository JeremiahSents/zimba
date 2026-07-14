import "server-only"

import { getZimbaApiSession } from "@/lib/api/auth"
import {
  getDashboardOverview,
  listExpenses,
  listProjects,
  listSuppliers,
} from "@/lib/api/client"
import {
  mockExpenses,
  mockProjects,
  mockSpendChart,
  mockSuppliers,
  mockUtilizationChart,
} from "@/lib/api/mock-data"
import {
  toExpenseTableRow,
  toProjectSummary,
  toSupplier,
} from "@/lib/api/normalizers"
import { formatCurrency, formatPercent } from "@/lib/format"
import type { DashboardOverviewData } from "@/lib/types"

export async function getDashboardOverviewData(): Promise<DashboardOverviewData> {
  const session = await getZimbaApiSession()

  if (!session) return getMockDashboardData()

  const [overview, projectPage, expensePage, apiSuppliers] = await Promise.all([
    getDashboardOverview(session),
    listProjects(session, { page: 1, page_size: 100 }),
    listExpenses(session, {
      page: 1,
      page_size: 100,
      sort_by: "expense_date",
      sort_order: "desc",
    }),
    listSuppliers(session, { page: 1, page_size: 100 }),
  ])

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
    stats: [
      {
        detail: "Across active construction sites",
        label: "Active projects",
        value: String(overview.totals.active_projects),
      },
      {
        detail: "Approved project allocations",
        label: "Total budget",
        value: formatCurrency(overview.totals.budget),
      },
      {
        detail: `${formatPercent(overview.totals.utilization_pct)} of current budgets`,
        label: "Total spent",
        value: formatCurrency(overview.totals.spent),
      },
      {
        detail: "Available before overruns",
        label: "Remaining",
        value: formatCurrency(overview.totals.remaining),
      },
    ],
    suppliers,
    utilizationChart: overview.utilization_by_period.map((period) => ({
      month: period.period,
      utilization: period.utilization_pct,
    })),
  }
}

function getMockDashboardData(): DashboardOverviewData {
  const totals = mockProjects.reduce(
    (acc, project) => {
      acc.budget += project.budget
      acc.remaining += project.remaining
      acc.spent += project.spent
      return acc
    },
    { budget: 0, remaining: 0, spent: 0 }
  )
  const utilization = totals.budget
    ? Math.round((totals.spent / totals.budget) * 100)
    : 0

  return {
    expenses: mockExpenses,
    projects: mockProjects,
    source: "mock",
    spendChart: mockSpendChart,
    stats: [
      {
        detail: "Across active construction sites",
        label: "Active projects",
        value: String(mockProjects.length),
      },
      {
        detail: "Approved project allocations",
        label: "Total budget",
        value: formatCurrency(totals.budget),
      },
      {
        detail: `${formatPercent(utilization)} of current budgets`,
        label: "Total spent",
        value: formatCurrency(totals.spent),
      },
      {
        detail: "Available before overruns",
        label: "Remaining",
        value: formatCurrency(totals.remaining),
      },
    ],
    suppliers: mockSuppliers,
    utilizationChart: mockUtilizationChart,
  }
}
