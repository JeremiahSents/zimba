import "server-only"
import type {
  ProjectDashboardResponse,
  ProjectDetailResponse,
} from "@/lib/types"
import * as allocationRepo from "../allocations/repository"
import { requireSession } from "../auth/service"
import * as expenseRepo from "../expenses/repository"
import * as fileRepo from "../files/repository"
import * as projectRepo from "./repository"

export async function getProjectsList() {
  const { organization } = await requireSession()
  const projects = await projectRepo.listProjects(organization.organizationId)

  return projects.map(toProjectDashboardResponse)
}

export async function getArchivedProjectsList() {
  const { organization } = await requireSession()
  const projects = await projectRepo.listArchivedProjects(
    organization.organizationId
  )

  return projects.map(toProjectDashboardResponse)
}

export async function getProjectDetail(
  projectId: string
): Promise<ProjectDetailResponse | null> {
  const { organization } = await requireSession()
  const project = await projectRepo.getProject(
    organization.organizationId,
    projectId
  )

  if (!project) {
    return null
  }

  const allocations = await allocationRepo.listAllocations(
    organization.organizationId,
    projectId
  )
  const [expenseRows, attachments] = await Promise.all([
    expenseRepo.listFinancialExpenseRows(organization.organizationId),
    fileRepo.listProjectAttachments(organization.organizationId, projectId),
  ])
  const projectExpenseRows = expenseRows.filter(
    (expense) => expense.projectId === projectId
  )
  const flatExpenses = projectExpenseRows.map((expense) => ({
    id: expense.id,
    receipt_id: expense.receiptId,
    project_id: projectId,
    allocation_id: expense.allocationId,
    date: expense.date.toISOString(),
    task_name: expense.taskName,
    supplier_name: expense.supplierName ?? "Unknown supplier",
    item_description: expense.itemDescription,
    amount: expense.amountCents / 100,
    quantity: 1,
    unit_rate: expense.amountCents / 100,
    paid_amount: expense.paidCents / 100,
    outstanding_amount:
      Math.max(0, expense.amountCents - expense.paidCents) / 100,
    status: toProjectExpenseStatus({
      amountCents: expense.amountCents,
      paidCents: expense.paidCents,
      paymentStatus: expense.paymentStatus,
    }),
  }))
  const supplierTotals = new Map<string, number>()
  for (const expense of flatExpenses)
    supplierTotals.set(
      expense.supplier_name,
      (supplierTotals.get(expense.supplier_name) ?? 0) + expense.amount
    )
  const allocationSpend = new Map<string, number>()
  for (const expense of flatExpenses)
    if (expense.allocation_id)
      allocationSpend.set(
        expense.allocation_id,
        (allocationSpend.get(expense.allocation_id) ?? 0) + expense.amount
      )

  const dashboardResponse: ProjectDashboardResponse = {
    id: project.id,
    name: project.name,
    location: project.location,
    plot_size: project.plotSize,
    land_size: project.landSize,
    building_type: project.buildingType,
    client_name: project.clientName,
    status: project.status,
    start_date: project.startDate ? project.startDate.toISOString() : null,
    target_end_date: project.targetEndDate
      ? project.targetEndDate.toISOString()
      : null,
    currency: project.currency,
    budget: project.budgetCents / 100,
    spent: project.spentCents / 100,
    remaining: project.remainingCents / 100,
    pct:
      project.budgetCents > 0
        ? Math.round((project.spentCents / project.budgetCents) * 100)
        : 0,
  }

  return {
    ...dashboardResponse,
    attachments: attachments.map(({ file }) => ({
      id: file.id,
      key: file.key,
      filename: file.filename,
      content_type: file.contentType,
      size_bytes: file.sizeBytes,
      url: file.url,
      purpose: file.purpose,
      created_at: file.createdAt.toISOString(),
    })),
    tasks: allocations.map((a) => ({
      id: a.id,
      name: a.name,
      budget: a.budgetCents / 100,
      spent: allocationSpend.get(a.id) ?? 0,
      pct: a.budgetCents
        ? Math.round(((allocationSpend.get(a.id) ?? 0) * 10000) / a.budgetCents)
        : 0,
    })),
    allocations: allocations.map((a) => ({
      id: a.id,
      name: a.name,
      budget: a.budgetCents / 100,
      spent: allocationSpend.get(a.id) ?? 0,
      remaining: Math.max(
        0,
        a.budgetCents / 100 - (allocationSpend.get(a.id) ?? 0)
      ),
      utilization_pct: a.budgetCents
        ? Math.round(((allocationSpend.get(a.id) ?? 0) * 10000) / a.budgetCents)
        : 0,
    })),
    expenses: flatExpenses,
    suppliers: [...supplierTotals].map(([name, amount]) => ({ name, amount })),
    upcoming_payments: [],
  }
}

function toProjectExpenseStatus(row: {
  amountCents: number
  paidCents: number
  paymentStatus?: string
}): "Full" | "Partial" | "Not paid" {
  if (row.paidCents > 0) {
    return row.paidCents >= row.amountCents && row.amountCents > 0
      ? "Full"
      : "Partial"
  }

  if (row.paymentStatus === "paid") return "Full"
  if (row.paymentStatus === "partial") return "Partial"
  return "Not paid"
}

function toProjectDashboardResponse(
  p: Awaited<ReturnType<typeof projectRepo.listProjects>>[number]
): ProjectDashboardResponse {
  return {
    id: p.id,
    name: p.name,
    location: p.location,
    plot_size: p.plotSize,
    land_size: p.landSize,
    building_type: p.buildingType,
    client_name: p.clientName,
    status: p.status,
    start_date: p.startDate ? p.startDate.toISOString() : null,
    target_end_date: p.targetEndDate ? p.targetEndDate.toISOString() : null,
    currency: p.currency,
    budget: p.budgetCents / 100,
    spent: p.spentCents / 100,
    remaining: p.remainingCents / 100,
    pct:
      p.budgetCents > 0 ? Math.round((p.spentCents / p.budgetCents) * 100) : 0,
  }
}
