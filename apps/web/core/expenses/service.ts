import "server-only"

import {
  correctReceiptCategoryUseCase,
  deleteReceiptUseCase,
  updateReceiptStatusUseCase,
} from "@workspace/api"
import type { WorkspaceRole } from "@workspace/contracts"
import { db } from "@workspace/db"
import type {
  ExpenseStatus,
  ExpenseTableRow,
  PayableExpenseResponse,
} from "@/lib/types"
import { recordAudit } from "../audit/service"
import { requireSession } from "../auth/service"
import { notFound } from "../shared/errors"
import * as expenseRepo from "./repository"

export async function listExpenseRows(): Promise<ExpenseTableRow[]> {
  const { organization } = await requireSession()
  const rows = await expenseRepo.listFinancialExpenseRows(
    organization.organizationId
  )
  return rows.map((row) => ({
    id: row.id,
    receipt_id: row.receiptId,
    project_id: row.projectId,
    supplier_id: row.supplierId,
    allocation_id: row.allocationId,
    category_state: row.categoryState,
    date: row.date.toISOString(),
    created_at: row.createdAt.toISOString(),
    task_name: row.taskName,
    supplier_name: row.supplierName ?? "Unknown supplier",
    item_description: row.itemDescription,
    amount: row.amountCents / 100,
    paid_amount: row.paidCents / 100,
    outstanding_amount: Math.max(0, row.amountCents - row.paidCents) / 100,
    project_name: row.projectName ?? "Unknown project",
    status: toUiStatus(getPaymentStatus(row)),
  }))
}

function getPaymentStatus(row: {
  amountCents: number
  paidCents: number
  paymentStatus?: string
}): string {
  if (row.paidCents > 0) {
    return row.paidCents >= row.amountCents && row.amountCents > 0
      ? "paid"
      : "partial"
  }

  return row.paymentStatus ?? "unpaid"
}
export async function updateExpenseStatus(
  expenseId: string,
  status: ExpenseStatus
) {
  const { user, organization } = await requireSession()
  return updateReceiptStatusUseCase(
    {
      userId: user.id,
      organizationId: organization.organizationId,
      role: organization.role as WorkspaceRole,
    },
    { executor: db, transaction: (callback) => db.transaction(callback) },
    expenseId,
    status
  )
}

export async function getPayableExpense(
  expenseId: string
): Promise<PayableExpenseResponse> {
  const { organization } = await requireSession()
  const result = await expenseRepo.getExpense(
    organization.organizationId,
    expenseId
  )
  if (!result) {
    const payable = await expenseRepo.getPayable(
      organization.organizationId,
      expenseId
    )
    if (!payable) notFound("Receipt not found.")
    const gross = payable.payable.amountCents / 100
    const paid =
      payable.payments.reduce((sum, payment) => sum + payment.amountCents, 0) /
      100
    const receiptNumber = payable.payable.title.startsWith("ZIMB/")
      ? payable.payable.title
      : undefined
    const itemDescription = payable.payable.description || "Expense"
    return {
      id: payable.payable.id,
      project_id: payable.payable.projectId,
      supplier_id: payable.payable.supplierId ?? "",
      currency: payable.payable.currency,
      receipt_number: receiptNumber,
      expense_date:
        payable.payable.dueDate?.toISOString() ??
        payable.payable.createdAt.toISOString(),
      approval_status: "approved",
      lifecycle_status: "incurred",
      gross_amount: gross,
      net_amount: gross,
      paid_amount: paid,
      outstanding_amount: Math.max(0, gross - paid),
      settlement_status:
        paid >= gross && gross > 0
          ? "paid"
          : paid > 0
            ? "partially_paid"
            : "unpaid",
      project_name: payable.projectName,
      supplier_name: payable.supplierName,
      category_state: "uncategorized",
      lines: [
        {
          id: payable.payable.id,
          allocation_id: "",
          allocation_name: "Uncategorized",
          description: itemDescription,
          quantity: 1,
          unit_amount: gross,
          tax_amount: 0,
          line_amount: gross,
        },
      ],
      payments: payable.payments.map((payment) => ({
        id: payment.id,
        amount: payment.amountCents / 100,
        payment_date:
          payment.paymentDate?.toISOString() ?? payment.createdAt.toISOString(),
        method: payment.method ?? "Other",
        reference: payment.reference,
        status: "posted",
      })),
    }
  }
  const gross =
    result.lines.reduce((sum, { line }) => sum + line.amountCents, 0) / 100
  const paid =
    result.payments.reduce((sum, payment) => sum + payment.amountCents, 0) / 100
  return {
    id: result.expense.id,
    project_id: result.expense.projectId ?? "",
    supplier_id: result.expense.supplierId ?? "",
    currency: "UGX",
    expense_date: result.expense.expenseDate?.toISOString() ?? null,
    approval_status: "approved",
    lifecycle_status: "incurred",
    gross_amount: gross,
    net_amount: gross,
    paid_amount: paid,
    outstanding_amount: Math.max(0, gross - paid),
    settlement_status:
      paid >= gross && gross > 0
        ? "paid"
        : paid > 0
          ? "partially_paid"
          : "unpaid",
    project_name: result.projectName,
    supplier_name: result.supplierName,
    receipt_file_url: result.receiptFile?.url ?? null,
    attachments: result.receiptFile
      ? [
          {
            id: result.receiptFile.id,
            key: result.receiptFile.key,
            filename: result.receiptFile.filename,
            content_type: result.receiptFile.contentType,
            size_bytes: result.receiptFile.sizeBytes,
            url: result.receiptFile.url,
            purpose: result.receiptFile.purpose,
            created_at: result.receiptFile.createdAt.toISOString(),
          },
        ]
      : [],
    category_state: result.lines.every(({ allocationName }) => !allocationName)
      ? "uncategorized"
      : "assigned",
    lines: result.lines.map(({ line, allocationName }) => ({
      id: line.id,
      allocation_id: line.allocationId,
      allocation_name: allocationName ?? "General",
      description: line.itemDescription,
      quantity: line.quantity,
      unit_amount: line.unitRateCents / 100,
      tax_amount: 0,
      line_amount: line.amountCents / 100,
    })),
    payments: result.payments.map((payment) => ({
      id: payment.id,
      amount: payment.amountCents / 100,
      payment_date:
        payment.paymentDate?.toISOString() ?? payment.createdAt.toISOString(),
      method: payment.method ?? "Other",
      reference: payment.reference,
      status: "posted",
    })),
  }
}
export async function correctReceiptCategory(
  receiptId: string,
  allocationId: string
) {
  const { user, organization } = await requireSession()
  const result = await correctReceiptCategoryUseCase(
    {
      userId: user.id,
      organizationId: organization.organizationId,
      role: organization.role as WorkspaceRole,
    },
    { executor: db, transaction: (callback) => db.transaction(callback) },
    receiptId,
    allocationId
  )
  await recordAudit({
    organizationId: organization.organizationId,
    actorId: user.id,
    action: "receipt.category.correct",
    entityType: "receipt",
    entityId: receiptId,
    changes: { allocationId },
  })
  return result
}

export async function deleteReceipt(receiptId: string) {
  const { user, organization } = await requireSession()
  const deleted = await deleteReceiptUseCase(
    {
      userId: user.id,
      organizationId: organization.organizationId,
      role: organization.role as WorkspaceRole,
    },
    { executor: db, transaction: (callback) => db.transaction(callback) },
    receiptId
  )
  await recordAudit({
    organizationId: organization.organizationId,
    actorId: user.id,
    action: "receipt.delete",
    entityType: "receipt",
    entityId: receiptId,
  })
  return deleted
}

/** Read-only operational report used before any historical data repair. */
export async function getReceiptCategoryAudit() {
  const { organization } = await requireSession()
  const rows = await expenseRepo.listFinancialExpenseRows(
    organization.organizationId
  )
  return {
    assigned: rows.filter((row) => row.categoryState === "assigned").length,
    uncategorizedLegacyPayables: rows
      .filter(
        (row) =>
          row.source === "payable" && row.categoryState === "uncategorized"
      )
      .map((row) => ({
        receiptId: row.receiptId,
        projectId: row.projectId,
        item: row.itemDescription,
      })),
    missingAllocationReferences: rows
      .filter(
        (row) =>
          row.source === "expense" && row.categoryState === "uncategorized"
      )
      .map((row) => ({
        receiptId: row.receiptId,
        projectId: row.projectId,
        item: row.itemDescription,
      })),
  }
}

function toUiStatus(status: string): ExpenseStatus {
  return status === "paid"
    ? "Full"
    : status === "partial"
      ? "Partial"
      : "Not paid"
}
