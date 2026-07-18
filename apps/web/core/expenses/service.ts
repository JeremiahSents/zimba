import "server-only"

import { and, eq } from "drizzle-orm"
import type { ExpenseReceiptCreate, ExpenseStatus, ExpenseTableRow, PayableExpenseCreate, PayableExpenseResponse } from "@/lib/types"
import { requireSession } from "../auth/service"
import { badRequest, notFound } from "../shared/errors"
import { db, schema } from "../shared/db"
import * as expenseRepo from "./repository"

export async function listExpenseRows(): Promise<ExpenseTableRow[]> {
  const { organization } = await requireSession()
  const rows = await expenseRepo.listExpenses(organization.organizationId)
  return Promise.all(rows.map(async ({ expense, projectName, supplierName }) => {
    const lines = await expenseRepo.getExpenseLines(organization.organizationId, expense.id)
    const amount = lines.reduce((sum, { line }) => sum + line.amountCents, 0) / 100
    const detail = await expenseRepo.getExpense(organization.organizationId, expense.id)
    const paidAmount = (detail?.payments ?? []).reduce((sum, payment) => sum + payment.amountCents, 0) / 100
    const first = lines[0]
    return {
      id: expense.id,
      receipt_id: expense.id,
      project_id: expense.projectId ?? undefined,
      allocation_id: first?.line.allocationId,
      date: (expense.expenseDate ?? expense.createdAt).toISOString(),
      task_name: first?.allocationName ?? "General",
      supplier_name: supplierName ?? "Unknown supplier",
      item_description: first?.line.itemDescription ?? "Expense",
      amount,
      paid_amount: paidAmount,
      outstanding_amount: Math.max(0, amount - paidAmount),
      project_name: projectName ?? "Unknown project",
      status: toUiStatus(expense.paymentStatus),
    }
  }))
}

export async function createPayableExpense(data: PayableExpenseCreate): Promise<PayableExpenseResponse> {
  const { organization } = await requireSession()
  const organizationId = organization.organizationId
  return db.transaction(async (tx) => {
    const projectId = String(data.project_id)
    const supplierId = String(data.supplier_id)
    const [project] = await tx.select().from(schema.project).where(and(eq(schema.project.id, projectId), eq(schema.project.organizationId, organizationId))).limit(1)
    const [supplier] = await tx.select().from(schema.supplier).where(and(eq(schema.supplier.id, supplierId), eq(schema.supplier.organizationId, organizationId))).limit(1)
    if (!project || !supplier) notFound("Project or supplier not found.")
    const expenseId = crypto.randomUUID()
    const [expense] = await tx.insert(schema.expense).values({ id: expenseId, organizationId, projectId, supplierId, receiptFileId: data.receipt_file_id, expenseDate: data.expense_date ? new Date(data.expense_date) : new Date(), paymentStatus: data.amount_paid ? "partial" : "unpaid" }).returning()
    if (!expense) throw new Error("Expense insert failed")
    const createdLines = []
    for (const line of data.lines) {
      const allocationId = String(line.allocation_id)
      const [allocation] = await tx.select().from(schema.allocation).where(and(eq(schema.allocation.id, allocationId), eq(schema.allocation.projectId, projectId), eq(schema.allocation.organizationId, organizationId))).limit(1)
      if (!allocation) badRequest("An allocation does not belong to this project.")
      const amount = line.quantity * line.unit_amount
      const id = crypto.randomUUID()
      await tx.insert(schema.expenseLine).values({ id, organizationId, expenseId, allocationId, itemDescription: line.description, quantity: line.quantity, unitRateCents: Math.round(line.unit_amount * 100), amountCents: Math.round(amount * 100) })
      createdLines.push({ id, allocation_id: allocationId, allocation_name: allocation.name, description: line.description, quantity: line.quantity, unit_amount: line.unit_amount, tax_amount: line.tax_amount ?? 0, line_amount: amount })
    }
    const gross = createdLines.reduce((sum, line) => sum + line.line_amount, 0)
    return { id: expense.id, project_id: projectId, supplier_id: supplierId, currency: data.currency, vendor_reference: data.vendor_reference, expense_date: expense.expenseDate?.toISOString() ?? null, due_date: data.due_date ?? null, approval_status: data.submit_for_approval ? "submitted" : "draft", lifecycle_status: data.lifecycle_status, gross_amount: gross, net_amount: gross, paid_amount: data.amount_paid ?? 0, outstanding_amount: Math.max(0, gross - (data.amount_paid ?? 0)), settlement_status: data.amount_paid ? "partially_paid" : "unpaid", project_name: project.name, supplier_name: supplier.name, lines: createdLines, payments: [] }
  })
}

export async function createExpenseReceipt(projectId: string, data: ExpenseReceiptCreate) {
  const { organization } = await requireSession()
  const organizationId = organization.organizationId
  return db.transaction(async (tx) => {
    const [project] = await tx.select().from(schema.project).where(and(eq(schema.project.id, projectId), eq(schema.project.organizationId, organizationId))).limit(1)
    if (!project) notFound("Project not found.")
    const supplierName = data.items[0]?.supplier_name.trim()
    if (!supplierName) badRequest("A supplier is required.")
    let [supplier] = await tx.select().from(schema.supplier).where(and(eq(schema.supplier.organizationId, organizationId), eq(schema.supplier.name, supplierName))).limit(1)
    if (!supplier) [supplier] = await tx.insert(schema.supplier).values({ organizationId, name: supplierName }).returning()
    if (!supplier) throw new Error("Supplier insert failed")
    const expenseId = crypto.randomUUID()
    await tx.insert(schema.expense).values({ id: expenseId, organizationId, projectId, supplierId: supplier.id, receiptFileId: data.receipt_file_id, paymentStatus: data.payment_status === "partially_paid" ? "partial" : data.payment_status ?? "paid", expenseDate: new Date(data.expense_date) })
    for (const item of data.items) {
      const allocationId = String(item.allocation_id)
      const [allocation] = await tx.select().from(schema.allocation).where(and(eq(schema.allocation.id, allocationId), eq(schema.allocation.projectId, projectId), eq(schema.allocation.organizationId, organizationId))).limit(1)
      if (!allocation) badRequest("An allocation does not belong to this project.")
      await tx.insert(schema.expenseLine).values({ organizationId, expenseId, allocationId, itemDescription: item.item_description, quantity: item.quantity, unitRateCents: Math.round(item.unit_rate * 100), amountCents: Math.round(item.quantity * item.unit_rate * 100) })
    }
    return { id: expenseId }
  })
}

export async function updateExpenseStatus(expenseId: string, status: ExpenseStatus) {
  const { organization } = await requireSession()
  const expense = await expenseRepo.updateExpense(organization.organizationId, expenseId, { paymentStatus: status === "Full" ? "paid" : status === "Partial" ? "partial" : "unpaid" })
  if (!expense) notFound("Expense not found.")
  return expense
}

export async function getPayableExpense(expenseId: string): Promise<PayableExpenseResponse> {
  const { organization } = await requireSession()
  const result = await expenseRepo.getExpense(organization.organizationId, expenseId)
  if (!result) notFound("Receipt not found.")
  const gross = result.lines.reduce((sum, { line }) => sum + line.amountCents, 0) / 100
  const paid = result.payments.reduce((sum, payment) => sum + payment.amountCents, 0) / 100
  return { id: result.expense.id, project_id: result.expense.projectId ?? "", supplier_id: result.expense.supplierId ?? "", currency: "UGX", expense_date: result.expense.expenseDate?.toISOString() ?? null, approval_status: "approved", lifecycle_status: "incurred", gross_amount: gross, net_amount: gross, paid_amount: paid, outstanding_amount: Math.max(0, gross - paid), settlement_status: paid >= gross && gross > 0 ? "paid" : paid > 0 ? "partially_paid" : "unpaid", project_name: result.projectName, supplier_name: result.supplierName, lines: result.lines.map(({ line, allocationName }) => ({ id: line.id, allocation_id: line.allocationId, allocation_name: allocationName ?? "General", description: line.itemDescription, quantity: line.quantity, unit_amount: line.unitRateCents / 100, tax_amount: 0, line_amount: line.amountCents / 100 })), payments: result.payments.map((payment) => ({ id: payment.id, amount: payment.amountCents / 100, payment_date: payment.paymentDate?.toISOString() ?? payment.createdAt.toISOString(), method: payment.method ?? "Other", reference: payment.reference, status: "posted" })) }
}

function toUiStatus(status: string): ExpenseStatus {
  return status === "paid" ? "Full" : status === "partial" ? "Partial" : "Not paid"
}
