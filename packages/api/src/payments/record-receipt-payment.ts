import type { TransactionRunner } from "@workspace/db/repositories"
import {
  createLedgerPayment,
  findExpenseForOrganization,
  findPayableForOrganization,
  syncExpensePaymentStatus,
  updatePayableForOrganization,
} from "@workspace/db/repositories"
import { z } from "zod"
import { notFoundError, validationError } from "../shared/application-error"
import { requireRole } from "../shared/authorization"
import type { WorkspaceContext } from "../shared/workspace-context"

const inputSchema = z.object({
  supplierId: z.string().trim().min(1),
  receiptId: z.string().trim().min(1),
  amountCents: z.number().int().positive(),
  currency: z.string().trim().length(3),
  paymentDate: z.coerce.date(),
  method: z.string().trim().min(1).max(80),
  reference: z.string().trim().max(240).optional(),
})

export async function recordReceiptPaymentUseCase(
  ctx: WorkspaceContext,
  deps: { transaction: TransactionRunner },
  rawInput: unknown
) {
  requireRole(ctx.role, ["owner", "site_manager", "accountant"])
  const input = inputSchema.safeParse(rawInput)
  if (!input.success) validationError("Enter a valid payment.")

  return deps.transaction(async (tx) => {
    const expense = await findExpenseForOrganization(
      tx,
      ctx.organizationId,
      input.data.receiptId
    )
    if (expense) {
      if (expense.expense.supplierId !== input.data.supplierId)
        validationError("Payment supplier does not match this receipt.")
      const totalCents = expense.lines.reduce(
        (sum, item) => sum + item.line.amountCents,
        0
      )
      const paidCents = expense.payments.reduce(
        (sum, payment) => sum + payment.amountCents,
        0
      )
      validateOutstanding(input.data.amountCents, totalCents - paidCents)
      const payment = await createLedgerPayment(tx, {
        organizationId: ctx.organizationId,
        supplierId: input.data.supplierId,
        expenseId: input.data.receiptId,
        amountCents: input.data.amountCents,
        currency: input.data.currency,
        paymentDate: input.data.paymentDate,
        method: input.data.method,
        reference: input.data.reference,
      })
      if (!payment) validationError("Invalid receipt payment.")
      await syncExpensePaymentStatus(
        tx,
        ctx.organizationId,
        input.data.receiptId
      )
      return payment
    }

    const payable = await findPayableForOrganization(
      tx,
      ctx.organizationId,
      input.data.receiptId
    )
    if (!payable) notFoundError("Receipt not found.")
    if (payable.payable.supplierId !== input.data.supplierId)
      validationError("Payment supplier does not match this receipt.")
    const paidCents = payable.payments.reduce(
      (sum, payment) => sum + payment.amountCents,
      0
    )
    validateOutstanding(
      input.data.amountCents,
      payable.payable.amountCents - paidCents
    )
    const payment = await createLedgerPayment(tx, {
      organizationId: ctx.organizationId,
      supplierId: input.data.supplierId,
      payableId: input.data.receiptId,
      amountCents: input.data.amountCents,
      currency: input.data.currency,
      paymentDate: input.data.paymentDate,
      method: input.data.method,
      reference: input.data.reference,
    })
    if (!payment) validationError("Invalid receipt payment.")
    if (payable.payable.amountCents - paidCents - input.data.amountCents <= 0) {
      await updatePayableForOrganization(
        tx,
        ctx.organizationId,
        input.data.receiptId,
        {
          status: "paid",
        }
      )
    }
    return payment
  })
}

function validateOutstanding(amountCents: number, outstandingCents: number) {
  if (outstandingCents <= 0)
    validationError("This receipt is already fully paid.")
  if (amountCents > outstandingCents)
    validationError("Payment cannot exceed the outstanding balance.")
}
