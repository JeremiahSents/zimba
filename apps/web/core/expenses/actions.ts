"use server"

import { createReceipt as createReceiptUseCase } from "@workspace/api"
import {
  expenseLinkSchema,
  idSchema,
  receiptStatusInputSchema,
} from "@workspace/contracts"
import { db } from "@workspace/db"
import { revalidatePath } from "next/cache"
import { ensureActionSession } from "@/core/auth/action-session"
import { getWorkspaceContext } from "@/core/auth/workspace-context"
import { getWorkspaceSlug } from "@/core/auth/workspace-slug"
import {
  correctReceiptCategory,
  deleteReceipt,
  getPayableExpense,
  updateExpenseStatus,
} from "@/core/expenses/service"
import {
  type ActionResult,
  expectedActionFailure,
} from "@/core/shared/action-result"
import { handleActionError } from "@/core/shared/handle-action-error"
import { hasValidPayableLines } from "@/lib/receipt-validation"
import type {
  ExpenseStatus,
  PayableExpenseCreate,
  PayableExpenseResponse,
} from "@/lib/types"

export async function createPayableExpenseAction(
  workspaceSlug: string,
  expense: PayableExpenseCreate
): Promise<ActionResult<PayableExpenseResponse>> {
  const authFailure = await ensureActionSession("expenses.create-payable")
  if (authFailure) return authFailure
  if (!expenseLinkSchema.safeParse(expense).success) {
    return expectedActionFailure(
      "VALIDATION_FAILED",
      "Select a valid project and supplier."
    )
  }
  if (
    !expense.project_id ||
    !expense.supplier_id ||
    !hasValidPayableLines(expense.lines)
  ) {
    return expectedActionFailure(
      "VALIDATION_FAILED",
      "Complete the supplier and every expense line."
    )
  }

  try {
    const ctx = await getWorkspaceContext(workspaceSlug)
    const created = await createReceiptUseCase(
      ctx,
      { runInTransaction: (callback) => db.transaction(callback) },
      {
        projectId: String(expense.project_id),
        supplierId: String(expense.supplier_id),
        expenseDate: expense.expense_date
          ? new Date(expense.expense_date)
          : undefined,
        currency: expense.currency,
        receiptFileId: expense.receipt_file_id,
        lines: expense.lines.map((line) => ({
          allocationId: String(line.allocation_id),
          itemDescription: line.description,
          quantity: line.quantity,
          unitRateCents: Math.round(line.unit_amount * 100),
          amountCents: Math.round(line.quantity * line.unit_amount * 100),
        })),
        payment: expense.amount_paid
          ? {
              amountCents: Math.round(expense.amount_paid * 100),
              currency: expense.currency,
              paymentDate: expense.payment_date
                ? new Date(expense.payment_date)
                : undefined,
              method: expense.payment_method,
              reference: expense.payment_reference,
            }
          : undefined,
      }
    )
    const payable = await getPayableExpense(created.id)
    revalidateConnectedRoutes(undefined, workspaceSlug)
    return { success: true, data: payable }
  } catch (error) {
    return handleActionError(error, "expenses.create-payable")
  }
}

export async function updateExpenseStatusAction(
  projectId: string,
  expenseId: string,
  status: ExpenseStatus
): Promise<ActionResult> {
  const authFailure = await ensureActionSession("expenses.update-status")
  if (authFailure) return authFailure
  if (
    !receiptStatusInputSchema.safeParse({ projectId, expenseId, status })
      .success
  )
    return expectedActionFailure("VALIDATION_FAILED", "Invalid receipt update.")
  try {
    await updateExpenseStatus(expenseId, status)
    revalidateConnectedRoutes(projectId)
    return { success: true, data: undefined }
  } catch (error) {
    return handleActionError(error, "expenses.update-status")
  }
}

export async function correctReceiptCategoryAction(
  receiptId: string,
  projectId: string,
  allocationId: string
): Promise<ActionResult> {
  const authFailure = await ensureActionSession("expenses.correct-category")
  if (authFailure) return authFailure
  if (
    ![receiptId, projectId, allocationId].every(
      (value) => idSchema.safeParse(value).success
    )
  )
    return expectedActionFailure(
      "VALIDATION_FAILED",
      "Invalid receipt or category."
    )
  if (!allocationId)
    return expectedActionFailure("VALIDATION_FAILED", "Select a category.")
  try {
    await correctReceiptCategory(receiptId, allocationId)
    revalidateConnectedRoutes(projectId)
    const slug = await getWorkspaceSlug()
    revalidatePath(`/${slug}/expenses/receipts/${receiptId}`)
    return { success: true, data: undefined }
  } catch (error) {
    return handleActionError(error, "expenses.correct-category")
  }
}

export async function deleteReceiptAction(
  receiptId: string,
  projectId: string
): Promise<ActionResult> {
  const authFailure = await ensureActionSession("expenses.delete")
  if (authFailure) return authFailure
  if (
    !idSchema.safeParse(receiptId).success ||
    !idSchema.safeParse(projectId).success
  )
    return expectedActionFailure("VALIDATION_FAILED", "Invalid receipt.")
  try {
    await deleteReceipt(receiptId)
    revalidateConnectedRoutes(projectId)
    return { success: true, data: undefined }
  } catch (error) {
    return handleActionError(error, "expenses.delete")
  }
}

async function revalidateConnectedRoutes(
  projectId?: string,
  workspaceSlug?: string
) {
  const slug = workspaceSlug ?? (await getWorkspaceSlug())
  revalidatePath(`/${slug}/home`)
  revalidatePath(`/${slug}/expenses`)
  revalidatePath(`/${slug}/projects`)
  revalidatePath(`/${slug}/suppliers`)
  revalidatePath(`/${slug}/analytics`)
  revalidatePath(`/${slug}/budget`)
  revalidatePath(`/${slug}/reports`)
  if (projectId) revalidatePath(`/${slug}/projects/${projectId}`)
  if (projectId) revalidatePath(`/${slug}/projects/${projectId}/files`)
}
