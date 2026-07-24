import type {
  DatabaseExecutor,
  TransactionRunner,
} from "@workspace/db/repositories"
import {
  findExpenseForOrganization,
  insertReceiptPayment,
  updateReceiptForOrganization,
  updateReceiptPaymentStatus,
} from "@workspace/db/repositories"
import { notFoundError, validationError } from "../shared/application-error"
import { requireRole } from "../shared/authorization"
import type { WorkspaceContext } from "../shared/workspace-context"

type ExpenseStatus = "Full" | "Partial" | "Not paid"

export async function updateReceiptStatusUseCase(
  ctx: WorkspaceContext,
  deps: { executor: DatabaseExecutor; transaction: TransactionRunner },
  receiptId: string,
  status: ExpenseStatus
) {
  requireRole(ctx.role, ["owner", "site_manager", "accountant"])
  if (!["Full", "Partial", "Not paid"].includes(status))
    validationError("Invalid receipt status.")
  if (status !== "Full") {
    const updated = await updateReceiptForOrganization(
      deps.executor,
      ctx.organizationId,
      receiptId,
      {
        paymentStatus: status === "Partial" ? "partial" : "unpaid",
      }
    )
    if (!updated) notFoundError("Receipt not found.")
    return updated
  }
  return deps.transaction(async (tx) => {
    const detail = await findExpenseForOrganization(
      tx,
      ctx.organizationId,
      receiptId
    )
    if (!detail) notFoundError("Receipt not found.")
    const totalCents = detail.lines.reduce(
      (sum, row) => sum + row.line.amountCents,
      0
    )
    const paidCents = detail.payments.reduce(
      (sum, payment) => sum + payment.amountCents,
      0
    )
    if (totalCents > paidCents)
      await insertReceiptPayment(tx, {
        organizationId: ctx.organizationId,
        expenseId: receiptId,
        supplierId: detail.expense.supplierId,
        amountCents: totalCents - paidCents,
        currency: "UGX",
        paymentDate: new Date(),
        method: "full_payment",
      })
    const updated = await updateReceiptPaymentStatus(
      tx,
      ctx.organizationId,
      receiptId,
      "paid"
    )
    if (!updated) notFoundError("Receipt not found.")
    return updated
  })
}
