"use server"

import { revalidatePath } from "next/cache"
import { ApplicationError } from "@/core/shared/errors"
import { createUpcomingPayment, updateUpcomingPayment, deleteUpcomingPayment, createLedgerPayment } from "@/core/payments/service"
import { markExpenseFullyPaid } from "@/core/payments/service"
import type { ActionResult } from "@/core/shared/action-result"
import type { UpcomingPaymentCreate, UpcomingPaymentUpdate } from "@/lib/types"
import { requireSession } from "@/core/auth/service"

export async function createUpcomingPaymentAction(
  projectId: string,
  payment: UpcomingPaymentCreate
): Promise<ActionResult> {
  await requireSession()
  if (!payment.title.trim() || payment.amount <= 0 || !payment.due_date) {
    return { success: false, error: { code: "bad_request", message: "Add a title, amount, and due date." } }
  }

  try {
    await createUpcomingPayment(projectId, payment)
    revalidateConnectedRoutes(projectId)
    return { success: true, data: undefined }
  } catch (error) {
    return actionError(error)
  }
}

export async function updateUpcomingPaymentAction(
  projectId: string,
  paymentId: string,
  payment: UpcomingPaymentUpdate
): Promise<ActionResult> {
  await requireSession()
  try {
    await updateUpcomingPayment(paymentId, payment)
    revalidateConnectedRoutes(projectId)
    return { success: true, data: undefined }
  } catch (error) {
    return actionError(error)
  }
}

export async function deleteUpcomingPaymentAction(
  projectId: string,
  paymentId: string
): Promise<ActionResult> {
  await requireSession()
  try {
    await deleteUpcomingPayment(paymentId)
    revalidateConnectedRoutes(projectId)
    return { success: true, data: undefined }
  } catch (error) {
    return actionError(error)
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
  await requireSession()
  if (
    input.amount <= 0 ||
    input.amount > input.outstandingAmount ||
    !input.paymentDate ||
    !input.method.trim()
  ) {
    return {
      success: false,
      error: { code: "bad_request", message: "Enter a valid payment within the outstanding balance." },
    }
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
    return actionError(error)
  }
}

export async function markReceiptFullyPaidAction(expenseId: string, projectId: string, idempotencyKey: string): Promise<ActionResult> {
  await requireSession()
  try {
    await markExpenseFullyPaid(expenseId, idempotencyKey)
    revalidateConnectedRoutes(projectId)
    revalidatePath(`/admin/expenses/receipts/${expenseId}`)
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
