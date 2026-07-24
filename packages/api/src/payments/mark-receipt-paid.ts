import type { TransactionRunner } from "@workspace/db/repositories"
import {
  appendAuditEvent,
  createLedgerPayment,
  findExpenseForOrganization,
  findPayableForOrganization,
  updatePayableForOrganization,
  updateReceiptForOrganization,
} from "@workspace/db/repositories"
import { z } from "zod"
import {
  conflictError,
  notFoundError,
  validationError,
} from "../shared/application-error"
import { requireRole } from "../shared/authorization"
import type { WorkspaceContext } from "../shared/workspace-context"

const idSchema = z.string().trim().min(1)

export async function markReceiptFullyPaidUseCase(
  ctx: WorkspaceContext,
  deps: { transaction: TransactionRunner },
  rawReceiptId: unknown,
  rawIdempotencyKey: unknown
) {
  requireRole(ctx.role, ["owner", "site_manager", "accountant"])
  const receiptId = idSchema.safeParse(rawReceiptId)
  const idempotencyKey = idSchema.safeParse(rawIdempotencyKey)
  if (!receiptId.success || !idempotencyKey.success)
    validationError("Invalid receipt payment.")

  return deps.transaction(async (tx) => {
    const expense = await findExpenseForOrganization(
      tx,
      ctx.organizationId,
      receiptId.data
    )
    if (expense) {
      const totalCents = expense.lines.reduce(
        (sum, item) => sum + item.line.amountCents,
        0
      )
      const paidCents = expense.payments.reduce(
        (sum, payment) => sum + payment.amountCents,
        0
      )
      const outstandingCents = totalCents - paidCents
      if (outstandingCents <= 0)
        conflictError("This receipt is already fully paid.")
      const payment = await createLedgerPayment(tx, {
        organizationId: ctx.organizationId,
        expenseId: receiptId.data,
        supplierId: expense.expense.supplierId,
        amountCents: outstandingCents,
        currency: "UGX",
        paymentDate: new Date(),
        method: "full_payment",
        idempotencyKey: idempotencyKey.data,
      })
      if (!payment) validationError("Invalid receipt payment.")
      await updateReceiptForOrganization(
        tx,
        ctx.organizationId,
        receiptId.data,
        {
          paymentStatus: "paid",
        }
      )
      await appendAuditEvent(tx, {
        organizationId: ctx.organizationId,
        actorId: ctx.userId,
        action: "receipt.mark_fully_paid",
        entityType: "expense",
        entityId: receiptId.data,
        changes: { amountCents: outstandingCents },
      })
      return payment
    }

    const payable = await findPayableForOrganization(
      tx,
      ctx.organizationId,
      receiptId.data
    )
    if (!payable) notFoundError("Receipt not found.")
    const totalCents = payable.payable.amountCents
    const paidCents = payable.payments.reduce(
      (sum, payment) => sum + payment.amountCents,
      0
    )
    const outstandingCents = totalCents - paidCents
    if (outstandingCents <= 0)
      conflictError("This receipt is already fully paid.")
    const payment = await createLedgerPayment(tx, {
      organizationId: ctx.organizationId,
      payableId: receiptId.data,
      supplierId: payable.payable.supplierId,
      amountCents: outstandingCents,
      currency: payable.payable.currency,
      paymentDate: new Date(),
      method: "full_payment",
      idempotencyKey: idempotencyKey.data,
    })
    if (!payment) validationError("Invalid receipt payment.")
    await updatePayableForOrganization(tx, ctx.organizationId, receiptId.data, {
      status: "paid",
    })
    await appendAuditEvent(tx, {
      organizationId: ctx.organizationId,
      actorId: ctx.userId,
      action: "receipt.mark_fully_paid",
      entityType: "payable",
      entityId: receiptId.data,
      changes: { amountCents: outstandingCents },
    })
    return payment
  })
}
