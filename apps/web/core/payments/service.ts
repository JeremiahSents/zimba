import "server-only"
import {
  createUpcomingPaymentUseCase,
  deleteUpcomingPaymentUseCase,
  markReceiptFullyPaidUseCase,
  recordReceiptPaymentUseCase,
  updateUpcomingPaymentUseCase,
} from "@workspace/api"
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
  const payment = await recordReceiptPaymentUseCase(
    {
      userId: user.id,
      organizationId: organization.organizationId,
      role: organization.role as never,
    },
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
  // Narrowed to the id: the caller needs it to generate a voucher, and a raw
  // database row has no business escaping into a Server Action.
  return { paymentId: payment?.id ?? null }
}

export async function markExpenseFullyPaid(
  expenseId: string,
  idempotencyKey: string
) {
  const { user, organization } = await requireSession()
  const payment = await markReceiptFullyPaidUseCase(
    {
      userId: user.id,
      organizationId: organization.organizationId,
      role: organization.role as never,
    },
    expenseId,
    idempotencyKey
  )
  return { paymentId: payment?.id ?? null }
}
