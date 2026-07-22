"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { ensureActionSession } from "@/core/auth/action-session"
import {
  createExpenseReceipt,
  createPayableExpense,
  correctReceiptCategory,
  deleteReceipt,
  updateExpenseStatus,
} from "@/core/expenses/service"
import {
  type ActionResult,
  expectedActionFailure,
} from "@/core/shared/action-result"
import { handleActionError } from "@/core/shared/handle-action-error"
import { hasValidPayableLines } from "@/lib/receipt-validation"
import type {
  ExpenseReceiptCreate,
  ExpenseStatus,
  PayableExpenseCreate,
  PayableExpenseResponse,
} from "@/lib/types"
import { expenseLinkSchema, idSchema, receiptStatusInputSchema } from "@workspace/contracts"


export async function createPayableExpenseAction(
  expense: PayableExpenseCreate
): Promise<ActionResult<PayableExpenseResponse>> {
  const authFailure = await ensureActionSession("expenses.create-payable")
  if (authFailure) return authFailure
  if (!expenseLinkSchema.safeParse(expense).success) {
    return expectedActionFailure("VALIDATION_FAILED", "Select a valid project and supplier.")
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
    const created = await createPayableExpense(expense)
    revalidateConnectedRoutes()
    return { success: true, data: created }
  } catch (error) {
    return handleActionError(error, "expenses.create-payable")
  }
}

export async function createExpenseReceiptAction(
  projectId: string,
  receipt: ExpenseReceiptCreate
): Promise<ActionResult> {
  const authFailure = await ensureActionSession("expenses.create-receipt")
  if (authFailure) return authFailure
  if (!idSchema.safeParse(projectId).success) return expectedActionFailure("VALIDATION_FAILED", "Invalid project.")
  if (
    !receipt.expense_date ||
    receipt.items.length === 0 ||
    receipt.items.some(
      (item) =>
        !item.allocation_id ||
        !item.supplier_name.trim() ||
        !item.item_description.trim() ||
        item.quantity <= 0 ||
        item.unit_rate < 0
    )
  ) {
    return expectedActionFailure(
      "VALIDATION_FAILED",
      "Complete every required receipt field."
    )
  }

  try {
    await createExpenseReceipt(projectId, receipt)
  } catch (error) {
    return handleActionError(error, "expenses.create-receipt")
  }

  revalidateConnectedRoutes(projectId)
  redirect(`/admin/projects/${projectId}`)
}

export async function updateExpenseStatusAction(
  projectId: string,
  expenseId: string,
  status: ExpenseStatus
): Promise<ActionResult> {
  const authFailure = await ensureActionSession("expenses.update-status")
  if (authFailure) return authFailure
  if (!receiptStatusInputSchema.safeParse({ projectId, expenseId, status }).success) return expectedActionFailure("VALIDATION_FAILED", "Invalid receipt update.")
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
  if (![receiptId, projectId, allocationId].every((value) => idSchema.safeParse(value).success)) return expectedActionFailure("VALIDATION_FAILED", "Invalid receipt or category.")
  if (!allocationId) return expectedActionFailure("VALIDATION_FAILED", "Select a category.")
  try {
    await correctReceiptCategory(receiptId, allocationId)
    revalidateConnectedRoutes(projectId)
    revalidatePath(`/admin/expenses/receipts/${receiptId}`)
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
  if (!idSchema.safeParse(receiptId).success || !idSchema.safeParse(projectId).success) return expectedActionFailure("VALIDATION_FAILED", "Invalid receipt.")
  try {
    await deleteReceipt(receiptId)
    revalidateConnectedRoutes(projectId)
    return { success: true, data: undefined }
  } catch (error) {
    return handleActionError(error, "expenses.delete")
  }
}

function revalidateConnectedRoutes(projectId?: string) {
  revalidatePath("/admin/home")
  revalidatePath("/admin/expenses")
  revalidatePath("/admin/projects")
  revalidatePath("/admin/suppliers")
  revalidatePath("/admin/analytics")
  revalidatePath("/admin/budget")
  revalidatePath("/admin/reports")
  if (projectId) revalidatePath(`/admin/projects/${projectId}`)
  if (projectId) revalidatePath(`/admin/projects/${projectId}/files`)
}
