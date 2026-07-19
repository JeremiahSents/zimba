"use server"

import { revalidatePath } from "next/cache"
import { expectedActionFailure, type ActionResult } from "@/core/shared/action-result"
import { handleActionError } from "@/core/shared/handle-action-error"
import { createUpcomingPayment, updateUpcomingPayment, deleteUpcomingPayment, createLedgerPayment } from "@/core/payments/service"
import { markExpenseFullyPaid } from "@/core/payments/service"
import type { UpcomingPaymentCreate, UpcomingPaymentUpdate } from "@/lib/types"
import { ensureActionSession } from "@/core/auth/action-session"

export async function createUpcomingPaymentAction(
  projectId: string,
  payment: UpcomingPaymentCreate
): Promise<ActionResult> {
  const authFailure = await ensureActionSession("payments.create-upcoming")
  if (authFailure) return authFailure
  if (!payment.title.trim() || payment.amount <= 0 || !payment.due_date) {
    return expectedActionFailure("VALIDATION_FAILED", "Add a title, amount, and due date.")
  }

  try {
    await createUpcomingPayment(projectId, payment)
    revalidateConnectedRoutes(projectId)
    return { success: true, data: undefined }
  } catch (error) {
    return handleActionError(error, "payments.create-upcoming")
  }
}

export async function updateUpcomingPaymentAction(
  projectId: string,
  paymentId: string,
  payment: UpcomingPaymentUpdate
): Promise<ActionResult> {
  const authFailure = await ensureActionSession("payments.update-upcoming")
  if (authFailure) return authFailure
  try {
    await updateUpcomingPayment(paymentId, payment)
    revalidateConnectedRoutes(projectId)
    return { success: true, data: undefined }
  } catch (error) {
    return handleActionError(error, "payments.update-upcoming")
  }
}

export async function deleteUpcomingPaymentAction(
  projectId: string,
  paymentId: string
): Promise<ActionResult> {
  const authFailure = await ensureActionSession("payments.delete-upcoming")
  if (authFailure) return authFailure
  try {
    await deleteUpcomingPayment(paymentId)
    revalidateConnectedRoutes(projectId)
    return { success: true, data: undefined }
  } catch (error) {
    return handleActionError(error, "payments.delete-upcoming")
  }
}

export async function recordReceiptPaymentAction(input: {
  expenseId: string
  projectId: string
  supplierId: string
  amount: number
  outstandingAmount: number
  currency: string
  paymentDate: string
  method: string
  reference?: string
}): Promise<ActionResult> {
  const authFailure = await ensureActionSession("payments.record-receipt")
  if (authFailure) return authFailure
  if (
    input.amount <= 0 ||
    input.amount > input.outstandingAmount ||
    !input.paymentDate ||
    !input.method.trim()
  ) {
    return expectedActionFailure(
      "VALIDATION_FAILED",
      "Enter a valid payment within the outstanding balance."
    )
  }

  try {
    await createLedgerPayment({
      supplier_id: input.supplierId,
      amount: input.amount,
      currency: input.currency,
      payment_date: input.paymentDate,
      method: input.method,
      reference: input.reference?.trim() || undefined,
      allocations: [{ expense_id: input.expenseId, amount: input.amount }],
    })
    revalidateConnectedRoutes(input.projectId)
    revalidatePath(`/admin/expenses/receipts/${input.expenseId}`)
    return { success: true, data: undefined }
  } catch (error) {
    return handleActionError(error, "payments.record-receipt")
  }
}

export async function markReceiptFullyPaidAction(expenseId: string, projectId: string, idempotencyKey: string): Promise<ActionResult> {
  const authFailure = await ensureActionSession("payments.mark-receipt-paid")
  if (authFailure) return authFailure
  try {
    await markExpenseFullyPaid(expenseId, idempotencyKey)
    revalidateConnectedRoutes(projectId)
    revalidatePath(`/admin/expenses/receipts/${expenseId}`)
    return { success: true, data: undefined }
  } catch (error) {
    return handleActionError(error, "payments.mark-receipt-paid")
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
