import "server-only"
import { requireSession } from "../auth/service"
import * as paymentRepo from "./repository"
import type { UpcomingPaymentCreate, UpcomingPaymentUpdate } from "@/lib/types"

export async function createUpcomingPayment(projectId: string, data: UpcomingPaymentCreate) {
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

export async function updateUpcomingPayment(paymentId: string, data: UpcomingPaymentUpdate) {
  const { organization } = await requireSession()
  
  const payable = await paymentRepo.updatePayable(organization.organizationId, paymentId, {
    title: data.title,
    description: data.description,
    amountCents: data.amount === undefined ? undefined : Math.round(data.amount * 100),
    currency: data.currency,
    dueDate: data.due_date ? new Date(data.due_date) : undefined,
    status: data.status ?? undefined,
  })

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
    expenseId: data.allocations[0]?.expense_id,
  })

  // Optionally here we would also record the allocation to the expense, but we don't have that model yet.
  
  return payment
}
