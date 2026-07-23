import "server-only"
import {
  createUpcomingPaymentUseCase,
  deleteUpcomingPaymentUseCase,
  updateUpcomingPaymentUseCase,
} from "@workspace/api"
import { db } from "@workspace/db"
import type { UpcomingPaymentCreate, UpcomingPaymentUpdate } from "@/lib/types"
import { recordAudit } from "../audit/service"
import { requireSession } from "../auth/service"
import { getExpense, getPayable, updateExpense } from "../expenses/repository"
import { badRequest, notFound } from "../shared/errors"
import * as paymentRepo from "./repository"

export async function createUpcomingPayment(
  projectId: string,
  data: UpcomingPaymentCreate
) {
  const { user, organization } = await requireSession()
  return createUpcomingPaymentUseCase(
    {
      userId: user.id,
      organizationId: organization.organizationId,
      role: organization.role as never,
    },
    { executor: db },
    {
      projectId,
      title: data.title,
      description: data.description,
      amount: data.amount,
      currency: data.currency,
      dueDate: data.due_date,
    }
  )
}

export async function updateUpcomingPayment(
  paymentId: string,
  data: UpcomingPaymentUpdate
) {
  const { user, organization } = await requireSession()
  return updateUpcomingPaymentUseCase(
    {
      userId: user.id,
      organizationId: organization.organizationId,
      role: organization.role as never,
    },
    { executor: db },
    paymentId,
    {
      title: data.title,
      description: data.description,
      amount: data.amount,
      currency: data.currency,
      dueDate: data.due_date,
      status: data.status,
    }
  )
}

export async function deleteUpcomingPayment(paymentId: string) {
  const { user, organization } = await requireSession()
  await deleteUpcomingPaymentUseCase(
    {
      userId: user.id,
      organizationId: organization.organizationId,
      role: organization.role as never,
    },
    { executor: db },
    paymentId
  )
}

export async function createLedgerPayment(data: {
  supplier_id: string
  amount: number
  currency: string
  payment_date: string
  method: string
  reference?: string
  allocations: { expense_id: string; amount: number }[]
}) {
  const { organization } = await requireSession()
  const receiptId = data.allocations[0]?.expense_id
  if (!receiptId) badRequest("Select a receipt for this payment.")

  const expense = await getExpense(organization.organizationId, receiptId)
  const payable = expense
    ? null
    : await getPayable(organization.organizationId, receiptId)
  if (!expense && !payable) notFound("Receipt not found.")

  const paymentId = crypto.randomUUID()
  const payment = await paymentRepo.createLedgerPayment({
    id: paymentId,
    organizationId: organization.organizationId,
    supplierId: data.supplier_id,
    amountCents: Math.round(data.amount * 100),
    currency: data.currency,
    paymentDate: new Date(data.payment_date),
    method: data.method,
    reference: data.reference,
    expenseId: expense ? receiptId : undefined,
    payableId: payable ? receiptId : undefined,
  })
  if (expense) {
    await paymentRepo.syncExpensePaymentStatus(
      organization.organizationId,
      receiptId
    )
  }

  return payment
}

export async function markExpenseFullyPaid(
  expenseId: string,
  idempotencyKey: string
) {
  const { user, organization } = await requireSession()
  const current = await getExpense(organization.organizationId, expenseId)
  if (!current) {
    const payable = await getPayable(organization.organizationId, expenseId)
    if (!payable) notFound("Receipt not found.")
    const totalCents = payable.payable.amountCents
    const paidCents = payable.payments.reduce(
      (sum, payment) => sum + payment.amountCents,
      0
    )
    const outstandingCents = totalCents - paidCents
    if (outstandingCents <= 0) badRequest("This receipt is already fully paid.")
    const payment = await paymentRepo.createLedgerPayment({
      organizationId: organization.organizationId,
      payableId: expenseId,
      supplierId: payable.payable.supplierId,
      amountCents: outstandingCents,
      currency: payable.payable.currency,
      paymentDate: new Date(),
      method: "full_payment",
      idempotencyKey,
    })
    await paymentRepo.updatePayable(organization.organizationId, expenseId, {
      status: "paid",
    })
    await recordAudit({
      organizationId: organization.organizationId,
      actorId: user.id,
      action: "receipt.mark_fully_paid",
      entityType: "payable",
      entityId: expenseId,
      changes: { amountCents: outstandingCents },
    })
    return payment
  }
  const totalCents = current.lines.reduce(
    (sum, item) => sum + item.line.amountCents,
    0
  )
  const paidCents = current.payments.reduce(
    (sum, payment) => sum + payment.amountCents,
    0
  )
  const outstandingCents = totalCents - paidCents
  if (outstandingCents <= 0) badRequest("This receipt is already fully paid.")
  const payment = await paymentRepo.createLedgerPayment({
    organizationId: organization.organizationId,
    expenseId,
    supplierId: current.expense.supplierId,
    amountCents: outstandingCents,
    currency: "UGX",
    paymentDate: new Date(),
    method: "full_payment",
    idempotencyKey,
  })
  await updateExpense(organization.organizationId, expenseId, {
    paymentStatus: "paid",
  })
  await recordAudit({
    organizationId: organization.organizationId,
    actorId: user.id,
    action: "receipt.mark_fully_paid",
    entityType: "expense",
    entityId: expenseId,
    changes: { amountCents: outstandingCents },
  })
  return payment
}
