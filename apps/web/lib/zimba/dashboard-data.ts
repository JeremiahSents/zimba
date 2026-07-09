import "server-only"

import { getZimbaApiSession } from "@/lib/zimba/auth"
import {
  listExpenses,
  listProjects,
  listSuppliers,
  ZimbaApiError,
} from "@/lib/zimba/api-client"
import { formatCurrency, formatPercent } from "@/lib/zimba/format"
import {
  mockExpenses,
  mockProjects,
  mockSpendChart,
  mockSuppliers,
  mockUtilizationChart,
} from "@/lib/zimba/mock-data"
import type {
  DashboardOverviewData,
  DashboardSource,
  ExpenseResponse,
  ExpenseTableRow,
  ProjectDashboardResponse,
  SupplierResponse,
} from "@/lib/zimba/types"

export async function getDashboardOverviewData(): Promise<DashboardOverviewData> {
  const session = getZimbaApiSession()

  if (!session) {
    return buildDashboardOverviewData({
      expenses: mockExpenses,
      projects: mockProjects,
      source: "mock",
      suppliers: mockSuppliers,
    })
  }

  try {
    const [projects, expenses, suppliers] = await Promise.all([
      listProjects(session),
      listExpenses(session),
      listSuppliers(session),
    ])

    return buildDashboardOverviewData({
      expenses: enrichExpenses(expenses),
      projects,
      source: "api",
      suppliers: normalizeSuppliers(suppliers),
    })
  } catch (error) {
    if (error instanceof ZimbaApiError) {
      console.warn(error.message)
    }

    return buildDashboardOverviewData({
      expenses: mockExpenses,
      projects: mockProjects,
      source: "mock",
      suppliers: mockSuppliers,
    })
  }
}

function buildDashboardOverviewData({
  expenses,
  projects,
  source,
  suppliers,
}: {
  expenses: ExpenseTableRow[]
  projects: ProjectDashboardResponse[]
  source: DashboardSource
  suppliers: SupplierResponse[]
}): DashboardOverviewData {
  const totals = projects.reduce(
    (acc, project) => {
      acc.budget += project.budget
      acc.spent += project.spent
      acc.remaining += project.remaining
      return acc
    },
    { budget: 0, remaining: 0, spent: 0 },
  )
  const averagePct =
    projects.length > 0
      ? Math.round(
          projects.reduce((total, project) => total + project.pct, 0) /
            projects.length,
        )
      : 0

  return {
    expenses,
    projects,
    source,
    spendChart: source === "mock" ? mockSpendChart : buildSpendChart(projects),
    stats: [
      {
        detail: "Across active construction sites",
        label: "Active projects",
        value: String(projects.length),
      },
      {
        detail: "Approved project allocations",
        label: "Total budget",
        value: formatCurrency(totals.budget),
      },
      {
        detail: `${formatPercent(averagePct)} of current budgets`,
        label: "Total spent",
        value: formatCurrency(totals.spent),
      },
      {
        detail: "Available before overruns",
        label: "Remaining",
        value: formatCurrency(totals.remaining),
      },
    ],
    suppliers,
    utilizationChart:
      source === "mock"
        ? mockUtilizationChart
        : buildUtilizationChart(projects, averagePct),
  }
}

function enrichExpenses(expenses: ExpenseResponse[]): ExpenseTableRow[] {
  return expenses.map((expense) => ({
    ...expense,
    project_name: "Project pending from API",
  }))
}

function normalizeSuppliers(suppliers: SupplierResponse[]): SupplierResponse[] {
  return suppliers.map((supplier) => ({
    amount: supplier.amount,
    category: supplier.category ?? "services",
    name: supplier.name,
    payments: supplier.payments ?? 0,
  }))
}

function buildSpendChart(projects: ProjectDashboardResponse[]) {
  return projects.map((project) => ({
    budget: project.budget,
    month: project.name,
    spent: project.spent,
  }))
}

function buildUtilizationChart(
  projects: ProjectDashboardResponse[],
  fallbackPct: number,
) {
  if (projects.length === 0) {
    return [{ month: "Current", utilization: fallbackPct }]
  }

  return projects.map((project) => ({
    month: project.name,
    utilization: project.pct,
  }))
}
