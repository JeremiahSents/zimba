import "server-only"
import { requireSession } from "../auth/service"
import * as paymentRepo from "./repository"
import { getExpense, getPayable } from "../expenses/repository"
import { updateExpense } from "../expenses/repository"
import { badRequest, notFound } from "../shared/errors"
import { recordAudit } from "../audit/service"
import type { UpcomingPaymentCreate, UpcomingPaymentUpdate } from "@/lib/types"

export async function createUpcomingPayment(
  projectId: string,
  data: UpcomingPaymentCreate
) {
  const { organization } = await requireSession()

  const paymentId = crypto.randomUUID()
  const payable = await paymentRepo.createPayable({
    id: paymentId,
    organizationId: organization.organizationId,
    projectId: projectId,
    title: data.title,
    description: data.description,
    amountCents: Math.round(data.amount * 100),
    currency: data.currency,
    dueDate: new Date(data.due_date),
    status: "pending",
  })

  return payable
}

export async function updateUpcomingPayment(
  paymentId: string,
  data: UpcomingPaymentUpdate
) {
  const { organization } = await requireSession()
  const payable = await paymentRepo.updatePayable(
    organization.organizationId,
    paymentId,
    {
      title: data.title,
      description: data.description,
      amountCents:
        data.amount === undefined ? undefined : Math.round(data.amount * 100),
      currency: data.currency,
      dueDate: data.due_date ? new Date(data.due_date) : undefined,
      status: data.status ?? undefined,
    }
  )

  return payable
}

export async function deleteUpcomingPayment(paymentId: string) {
  const { organization } = await requireSession()
  await paymentRepo.deletePayable(organization.organizationId, paymentId)
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
