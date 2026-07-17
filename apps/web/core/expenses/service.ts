import "server-only"
import { requireSession } from "../auth/service"
import * as expenseRepo from "./repository"
import type { PayableExpenseCreate, ExpenseReceiptCreate, ExpenseStatus } from "@/lib/types"

export async function createPayableExpense(data: PayableExpenseCreate) {
  const { organization } = await requireSession()
  
  const expenseId = crypto.randomUUID()
  const expense = await expenseRepo.createExpense({
    id: expenseId,
    organizationId: organization.organizationId,
    projectId: data.project_id.toString(),
    supplierId: data.supplier_id.toString(),
    paymentStatus: "unpaid",
  })

  let totalAmount = 0
  for (const line of data.lines) {
    const amountCents = Math.round(line.quantity * line.unit_amount * 100)
    totalAmount += amountCents
    await expenseRepo.createExpenseLine({
      id: crypto.randomUUID(),
      organizationId: organization.organizationId,
      expenseId: expenseId,
      allocationId: line.allocation_id.toString(),
      itemDescription: line.description,
      quantity: line.quantity,
      unitRateCents: Math.round(line.unit_amount * 100),
      amountCents: amountCents,
    })
  }

  return { id: expense.id, total_amount: totalAmount / 100 }
}

export async function createExpenseReceipt(projectId: string, data: ExpenseReceiptCreate) {
  const { organization } = await requireSession()
  
  const expenseId = crypto.randomUUID()
  const expense = await expenseRepo.createExpense({
    id: expenseId,
    organizationId: organization.organizationId,
    projectId: projectId,
    paymentStatus: "paid", // receipts are already paid
    expenseDate: new Date(data.expense_date),
  })

  let totalAmount = 0
  for (const item of data.items) {
    const amountCents = Math.round(item.quantity * item.unit_rate * 100)
    totalAmount += amountCents
    await expenseRepo.createExpenseLine({
      id: crypto.randomUUID(),
      organizationId: organization.organizationId,
      expenseId: expenseId,
      allocationId: item.allocation_id.toString(),
      itemDescription: item.item_description,
      quantity: item.quantity,
      unitRateCents: Math.round(item.unit_rate * 100),
      amountCents: amountCents,
    })
  }

  return { id: expense.id, total_amount: totalAmount / 100 }
}

export async function updateExpenseStatus(expenseId: string, status: ExpenseStatus) {
  const { organization } = await requireSession()
  
  const apiStatus = status === "Full" ? "paid" : status === "Partial" ? "partial" : "unpaid"
  const expense = await expenseRepo.updateExpense(expenseId, {
    paymentStatus: apiStatus,
  })

  return expense
}

export async function getPayableExpense(expenseId: string) {
  const { organization } = await requireSession()

  // Return a mock format matching the UI requirement for now since this is just UI bridging
  return {
    id: expenseId,
    project_id: 1,
    supplier_id: 1,
    currency: "UGX",
    approval_status: "approved",
    lifecycle_status: "incurred",
    gross_amount: 5000,
    net_amount: 5000,
    paid_amount: 0,
    outstanding_amount: 5000,
    settlement_status: "unpaid",
    project_name: "Mock Project",
    supplier_name: "Mock Supplier",
    lines: [],
    payments: [],
  } as any
}
