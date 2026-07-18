"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createPayableExpense, createExpenseReceipt, updateExpenseStatus } from "@/core/expenses/service"
import { ApplicationError } from "@/core/shared/errors"
import type { ActionResult } from "@/core/shared/action-result"
import type { PayableExpenseCreate, ExpenseReceiptCreate, ExpenseStatus, PayableExpenseResponse } from "@/lib/types"
import { requireSession } from "@/core/auth/service"

export async function createPayableExpenseAction(
  expense: PayableExpenseCreate
): Promise<ActionResult<PayableExpenseResponse>> {
  await requireSession()
  if (
    !expense.project_id ||
    !expense.supplier_id ||
    expense.lines.length === 0 ||
    expense.lines.some(
      (line) =>
        !line.allocation_id ||
        !line.description.trim() ||
        line.quantity <= 0 ||
        line.unit_amount < 0
    )
  ) {
    return { success: false, error: { code: "bad_request", message: "Complete the supplier and every expense line." } }
  }

  try {
    const created = await createPayableExpense(expense)
    revalidateConnectedRoutes()
    return { success: true, data: created }
  } catch (error) {
    return actionError(error)
  }
}

export async function createExpenseReceiptAction(
  projectId: string,
  receipt: ExpenseReceiptCreate
): Promise<ActionResult> {
  await requireSession()
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
    return { success: false, error: { code: "bad_request", message: "Complete every required receipt field." } }
  }

  try {
    await createExpenseReceipt(projectId, receipt)
  } catch (error) {
    return actionError(error)
  }

  revalidateConnectedRoutes(projectId)
  redirect(`/admin/projects/${projectId}`)
}

export async function updateExpenseStatusAction(
  projectId: string,
  expenseId: string,
  status: ExpenseStatus
): Promise<ActionResult> {
  await requireSession()
  try {
    await updateExpenseStatus(expenseId, status)
    revalidateConnectedRoutes(projectId)
    return { success: true, data: undefined }
  } catch (error) {
    return actionError(error)
  }
}

function actionError(error: unknown): { success: false; error: { code: string; message: string } } {
  if (error instanceof ApplicationError) {
    return { success: false, error: { code: error.code, message: error.message } }
  }
  console.error("Zimba Action failed", error)
  return {
    success: false,
    error: { code: "internal_error", message: "The request could not be completed. Please try again." },
  }
}

function revalidateConnectedRoutes(projectId?: string) {
  revalidatePath("/admin/home")
  revalidatePath("/admin/projects")
  revalidatePath("/admin/suppliers")
  revalidatePath("/admin/analytics")
  revalidatePath("/admin/budget")
  revalidatePath("/admin/reports")
  if (projectId) revalidatePath(`/admin/projects/${projectId}`)
  if (projectId) revalidatePath(`/admin/projects/${projectId}/files`)
}
