import "server-only"

import type { DashboardOverviewData } from "@/lib/types"
import { listExpenseRows } from "../expenses/service"
import { getProjectsList } from "../projects/service"
import { getSuppliersList } from "../suppliers/service"

export async function getDashboardOverviewData(): Promise<DashboardOverviewData> {
  const [projects, expenses, suppliers] = await Promise.all([
    getProjectsList(),
    listExpenseRows(),
    getSuppliersList(),
  ])

  return {
    projects,
    expenses,
    suppliers,
    spendChart: projects
      .slice(0, 6)
      .reverse()
      .map((project) => ({
        month: project.name,
        spent: project.spent,
        budget: project.budget,
      })),
    utilizationChart: projects
      .slice(0, 6)
      .reverse()
      .map((project) => ({ month: project.name, utilization: project.pct })),
  }
}
