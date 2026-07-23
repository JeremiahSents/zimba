import "server-only"

import {
  deleteReceiptUseCase,
  updateReceiptStatusUseCase,
} from "@workspace/api"
import type { WorkspaceRole } from "@workspace/contracts"
import { db } from "@workspace/db"
import {
  findActiveProjectForOrganization,
  findAllocationForProject,
  findCompletedFile,
  findSupplierForOrganization,
  insertReceipt,
  insertReceiptLine,
  insertReceiptPayment,
  updateReceiptPaymentStatus,
} from "@workspace/db/repositories"
import type {
  ExpenseStatus,
  ExpenseTableRow,
  PayableExpenseCreate,
  PayableExpenseResponse,
} from "@/lib/types"
import { recordAudit } from "../audit/service"
import { requireRole } from "../auth/permissions"
import { requireSession } from "../auth/service"
import { badRequest, notFound } from "../shared/errors"
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

export async function createPayableExpense(
  data: PayableExpenseCreate
): Promise<PayableExpenseResponse> {
  const { organization } = await requireSession()
  const organizationId = organization.organizationId
  return db.transaction(async (tx) => {
    const projectId = String(data.project_id)
    const supplierId = String(data.supplier_id)
    const [project] = await findActiveProjectForOrganization(
      tx,
      organizationId,
      projectId
    )
    const [supplier] = await findSupplierForOrganization(
      tx,
      organizationId,
      supplierId
    )
    if (!project || !supplier) notFound("Project or supplier not found.")
    if (data.receipt_file_id) {
      const file = await findCompletedFile(
        tx,
        organizationId,
        data.receipt_file_id,
        "expense_receipt"
      )
      if (!file)
        badRequest(
          "The receipt file is invalid or belongs to another workspace."
        )
    }
    const expenseId = crypto.randomUUID()
    const expense = await insertReceipt(tx, {
      id: expenseId,
      organizationId,
      projectId,
      supplierId,
      receiptFileId: data.receipt_file_id,
      expenseDate: data.expense_date ? new Date(data.expense_date) : new Date(),
      paymentStatus: data.amount_paid ? "partial" : "unpaid",
    })
    if (!expense) throw new Error("Expense insert failed")
    const createdLines = []
    for (const line of data.lines) {
      const allocationId = String(line.allocation_id)
      const [allocation] = await findAllocationForProject(
        tx,
        organizationId,
        projectId,
        allocationId
      )
      if (!allocation)
        badRequest("An allocation does not belong to this project.")
      const amount = line.quantity * line.unit_amount
      const id = crypto.randomUUID()
      await insertReceiptLine(tx, {
        id,
        organizationId,
        expenseId,
        allocationId,
        legacyAllocationId: allocationId,
        itemDescription: line.description,
        quantity: line.quantity,
        unitRateCents: Math.round(line.unit_amount * 100),
        amountCents: Math.round(amount * 100),
      })
      createdLines.push({
        id,
        allocation_id: allocationId,
        allocation_name: allocation.name,
        description: line.description,
        quantity: line.quantity,
        unit_amount: line.unit_amount,
        tax_amount: line.tax_amount ?? 0,
        line_amount: amount,
      })
    }
    const gross = createdLines.reduce((sum, line) => sum + line.line_amount, 0)
    const paidAmount = Math.min(data.amount_paid ?? 0, gross)
    if (paidAmount > 0) {
      await insertReceiptPayment(tx, {
        organizationId,
        expenseId: expense.id,
        supplierId,
        amountCents: Math.round(paidAmount * 100),
        currency: data.currency,
        paymentDate: data.payment_date
          ? new Date(data.payment_date)
          : new Date(),
        method: data.payment_method ?? "cash",
        reference: data.payment_reference,
      })
      await updateReceiptPaymentStatus(
        tx,
        organizationId,
        expense.id,
        paidAmount >= gross ? "paid" : "partial"
      )
    }
    return {
      id: expense.id,
      project_id: projectId,
      supplier_id: supplierId,
      currency: data.currency,
      vendor_reference: data.vendor_reference,
      expense_date: expense.expenseDate?.toISOString() ?? null,
      due_date: data.due_date ?? null,
      approval_status: data.submit_for_approval ? "submitted" : "draft",
      lifecycle_status: data.lifecycle_status,
      gross_amount: gross,
      net_amount: gross,
      paid_amount: paidAmount,
      outstanding_amount: Math.max(0, gross - paidAmount),
      settlement_status:
        paidAmount >= gross && gross > 0
          ? "paid"
          : paidAmount > 0
            ? "partially_paid"
            : "unpaid",
      project_name: project.name,
      supplier_name: supplier.name,
      lines: createdLines,
      payments: [],
    }
  })
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
  requireRole(organization.role, ["owner", "site_manager", "accountant"])
  const existing = await expenseRepo.getExpense(
    organization.organizationId,
    receiptId
  )
  const payable = existing
    ? null
    : await expenseRepo.getPayable(organization.organizationId, receiptId)
  const projectId = existing?.expense.projectId ?? payable?.payable.projectId
  if (!projectId) badRequest("This receipt is not linked to a project.")
  const [allocation] = await findAllocationForProject(
    db,
    organization.organizationId,
    projectId,
    allocationId
  )
  if (!allocation) badRequest("Allocation not found in this workspace.")
  if (!allocation) badRequest("Select a category belonging to this project.")

  if (existing) {
    await expenseRepo.updateExpenseLinesAllocation(
      organization.organizationId,
      receiptId,
      allocationId
    )
  } else if (payable) {
    await db.transaction(async (tx) => {
      await insertReceipt(tx, {
        id: payable.payable.id,
        organizationId: organization.organizationId,
        projectId: payable.payable.projectId,
        supplierId: payable.payable.supplierId,
        paymentStatus: payable.payable.status,
        expenseDate: payable.payable.dueDate ?? payable.payable.createdAt,
      })
      await insertReceiptLine(tx, {
        organizationId: organization.organizationId,
        expenseId: payable.payable.id,
        allocationId,
        legacyAllocationId: allocationId,
        itemDescription: payable.payable.description || payable.payable.title,
        quantity: 1,
        unitRateCents: payable.payable.amountCents,
        amountCents: payable.payable.amountCents,
      })
    })
  } else notFound("Receipt not found.")
  await recordAudit({
    organizationId: organization.organizationId,
    actorId: user.id,
    action: "receipt.category.correct",
    entityType: "receipt",
    entityId: receiptId,
    changes: { allocationId },
  })
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
