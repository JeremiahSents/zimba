import "server-only"
import { requireSession } from "../auth/service"
import * as projectRepo from "./repository"
import * as allocationRepo from "../allocations/repository"
import * as expenseRepo from "../expenses/repository"
import * as fileRepo from "../files/repository"
import * as paymentRepo from "../payments/repository"
import type { ProjectDashboardResponse, ProjectDetailResponse } from "@/lib/types"

export async function getProjectsList() {
  const { organization } = await requireSession()
  const projects = await projectRepo.listProjects(organization.organizationId)
  
  return projects.map((p): ProjectDashboardResponse => ({
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
    budget: p.budgetCents / 100, // Convert cents to decimal
    spent: p.spentCents / 100,
    remaining: p.remainingCents / 100,
    pct: p.budgetCents > 0 ? Math.round((p.spentCents / p.budgetCents) * 100) : 0,
  }))
}

export async function getProjectDetail(projectId: string): Promise<ProjectDetailResponse | null> {
  const { organization } = await requireSession()
  const project = await projectRepo.getProject(organization.organizationId, projectId)
  
  if (!project) {
    return null
  }

  const allocations = await allocationRepo.listAllocations(organization.organizationId, projectId)
  const [expenseRows, attachments, payables] = await Promise.all([
    expenseRepo.listExpenses(organization.organizationId),
    fileRepo.listProjectAttachments(organization.organizationId, projectId),
    paymentRepo.listProjectPayables(organization.organizationId, projectId),
  ])
  const projectExpenseRows = expenseRows.filter(({ expense }) => expense.projectId === projectId)
  const expenses = await Promise.all(projectExpenseRows.map(async ({ expense, supplierName }) => {
    const lines = await expenseRepo.getExpenseLines(organization.organizationId, expense.id)
    return lines.map(({ line, allocationName }) => ({
      id: line.id,
      receipt_id: expense.id,
      project_id: projectId,
      allocation_id: line.allocationId,
      date: (expense.expenseDate ?? expense.createdAt).toISOString(),
      task_name: allocationName ?? "General",
      supplier_name: supplierName ?? "Unknown supplier",
      item_description: line.itemDescription,
      amount: line.amountCents / 100,
      quantity: line.quantity,
      unit_rate: line.unitRateCents / 100,
      status: expense.paymentStatus === "paid" ? "Full" as const : expense.paymentStatus === "partial" ? "Partial" as const : "Not paid" as const,
    }))
  }))
  const flatExpenses = expenses.flat()
  const payableExpenses = await Promise.all(payables.map(async (payment) => {
    const detail = await expenseRepo.getPayable(organization.organizationId, payment.id)
    const paidCents = detail?.payments.reduce((sum, item) => sum + item.amountCents, 0) ?? 0
    const amount = payment.amountCents / 100
    return {
      id: payment.id,
      receipt_id: payment.id,
      project_id: projectId,
      allocation_id: undefined,
      date: (payment.dueDate ?? payment.createdAt).toISOString(),
      task_name: "General",
      supplier_name: detail?.supplierName ?? "Unknown supplier",
      item_description: payment.description || "Expense",
      amount,
      quantity: 1,
      unit_rate: amount,
      status: paidCents >= payment.amountCents && payment.amountCents > 0 ? "Full" as const : paidCents > 0 ? "Partial" as const : "Not paid" as const,
    }
  }))
  flatExpenses.push(...payableExpenses)
  const supplierTotals = new Map<string, number>()
  for (const expense of flatExpenses) supplierTotals.set(expense.supplier_name, (supplierTotals.get(expense.supplier_name) ?? 0) + expense.amount)
  const allocationSpend = new Map<string, number>()
  for (const expense of flatExpenses) if (expense.allocation_id) allocationSpend.set(expense.allocation_id, (allocationSpend.get(expense.allocation_id) ?? 0) + expense.amount)

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
    target_end_date: project.targetEndDate ? project.targetEndDate.toISOString() : null,
    currency: project.currency,
    budget: project.budgetCents / 100,
    spent: project.spentCents / 100,
    remaining: project.remainingCents / 100,
    pct: project.budgetCents > 0 ? Math.round((project.spentCents / project.budgetCents) * 100) : 0,
  }

  return {
    ...dashboardResponse,
    attachments: attachments.map(({ file }) => ({ id: file.id, filename: file.filename, content_type: file.contentType, size_bytes: file.sizeBytes, url: file.url, purpose: file.purpose, created_at: file.createdAt.toISOString() })),
    tasks: allocations.map(a => ({
      id: a.id,
      name: a.name,
      budget: a.budgetCents / 100,
      spent: allocationSpend.get(a.id) ?? 0,
      pct: a.budgetCents ? Math.round(((allocationSpend.get(a.id) ?? 0) * 10000) / a.budgetCents) : 0,
    })),
    allocations: allocations.map(a => ({
      id: a.id,
      name: a.name,
      budget: a.budgetCents / 100,
      spent: allocationSpend.get(a.id) ?? 0,
      remaining: Math.max(0, a.budgetCents / 100 - (allocationSpend.get(a.id) ?? 0)),
      utilization_pct: a.budgetCents ? Math.round(((allocationSpend.get(a.id) ?? 0) * 10000) / a.budgetCents) : 0,
    })),
    expenses: flatExpenses,
    suppliers: [...supplierTotals].map(([name, amount]) => ({ name, amount })),
    upcoming_payments: payables.map((payment) => ({ id: payment.id, project_id: payment.projectId, title: payment.title, description: payment.description, amount: payment.amountCents / 100, currency: payment.currency, due_date: payment.dueDate?.toISOString() ?? "", supplier_name: null, status: payment.status, created_at: payment.createdAt.toISOString(), updated_at: payment.updatedAt.toISOString() })),
  }
}
