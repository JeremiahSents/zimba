import "server-only"
import {
  createUpcomingPaymentUseCase,
  deleteUpcomingPaymentUseCase,
  markReceiptFullyPaidUseCase,
  recordReceiptPaymentUseCase,
  updateUpcomingPaymentUseCase,
} from "@workspace/api"
import { db } from "@workspace/db"
import type { UpcomingPaymentCreate, UpcomingPaymentUpdate } from "@/lib/types"
import { requireSession } from "../auth/service"

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
  const { user, organization } = await requireSession()
  const receiptId = data.allocations[0]?.expense_id
  return recordReceiptPaymentUseCase(
    {
      userId: user.id,
      organizationId: organization.organizationId,
      role: organization.role as never,
    },
    { transaction: (callback) => db.transaction(callback) },
    {
      supplierId: data.supplier_id,
      receiptId,
      amountCents: Math.round(data.amount * 100),
      currency: data.currency,
      paymentDate: data.payment_date,
      method: data.method,
      reference: data.reference,
    }
  )
}

export async function markExpenseFullyPaid(
  expenseId: string,
  idempotencyKey: string
) {
  const { user, organization } = await requireSession()
  return markReceiptFullyPaidUseCase(
    {
      userId: user.id,
      organizationId: organization.organizationId,
      role: organization.role as never,
    },
    { transaction: (callback) => db.transaction(callback) },
    expenseId,
    idempotencyKey
  )
}
