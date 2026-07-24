import type { ReceiptCreateOutputDto } from "@workspace/contracts"
import { receiptCreateInputSchema } from "@workspace/contracts"
import type {
  DatabaseExecutor,
  TransactionRunner,
} from "@workspace/db/repositories"
import {
  findActiveProjectForOrganization,
  findAllocationForProject,
  findCompletedFile,
  findSupplierForOrganization,
  insertReceipt,
  insertReceiptLine,
  insertReceiptPayment,
  updateReceiptPaymentStatus,
} from "@workspace/db/repositories"
import { notFoundError, validationError } from "../shared/application-error"
import type { WorkspaceContext } from "../shared/workspace-context"

export async function createReceipt(
  ctx: WorkspaceContext,
  deps: { runInTransaction: TransactionRunner },
  rawInput: unknown
): Promise<ReceiptCreateOutputDto> {
  const input = receiptCreateInputSchema.parse(rawInput)
  return deps.runInTransaction((executor) =>
    createReceiptInTransaction(ctx, executor, input)
  )
}

async function createReceiptInTransaction(
  ctx: WorkspaceContext,
  executor: DatabaseExecutor,
  input: ReturnType<typeof receiptCreateInputSchema.parse>
): Promise<ReceiptCreateOutputDto> {
  const organizationId = ctx.organizationId

  const [project] = await findActiveProjectForOrganization(
    executor,
    organizationId,
    input.projectId
  )
  if (!project) notFoundError("Project not found.")

  const [supplier] = await findSupplierForOrganization(
    executor,
    organizationId,
    input.supplierId
  )
  if (!supplier) notFoundError("Supplier not found.")

  if (input.receiptFileId) {
    const file = await findCompletedFile(
      executor,
      organizationId,
      input.receiptFileId,
      "expense_receipt"
    )
    if (!file)
      validationError(
        "The receipt file is invalid or belongs to another workspace."
      )
  }

  const totalCents = input.lines.reduce(
    (sum, line) => sum + line.amountCents,
    0
  )
  if (totalCents <= 0)
    validationError("Receipt total must be greater than zero.")

  for (const line of input.lines) {
    if (line.quantity <= 0) validationError("Quantities must be positive.")
    if (line.unitRateCents < 0)
      validationError("Unit rates cannot be negative.")
    if (line.amountCents !== line.quantity * line.unitRateCents)
      validationError(
        "Line amount must equal quantity multiplied by unit rate."
      )
    const [allocation] = await findAllocationForProject(
      executor,
      organizationId,
      input.projectId,
      line.allocationId
    )
    if (!allocation)
      validationError("An allocation does not belong to this project.")
  }

  if (input.payment && input.payment.amountCents > totalCents)
    validationError("Payment cannot exceed the receipt total.")

  const expenseId = crypto.randomUUID()
  const paidCents = input.payment
    ? Math.min(input.payment.amountCents, totalCents)
    : 0
  const paymentStatus =
    paidCents >= totalCents && totalCents > 0
      ? "paid"
      : paidCents > 0
        ? "partial"
        : "unpaid"

  await insertReceipt(executor, {
    id: expenseId,
    organizationId,
    projectId: input.projectId,
    supplierId: input.supplierId,
    receiptFileId: input.receiptFileId,
    expenseDate: input.expenseDate ?? new Date(),
    paymentStatus,
  })

  for (const line of input.lines) {
    await insertReceiptLine(executor, {
      id: crypto.randomUUID(),
      organizationId,
      expenseId,
      allocationId: line.allocationId,
      legacyAllocationId: line.allocationId,
      itemDescription: line.itemDescription,
      quantity: line.quantity,
      unitRateCents: line.unitRateCents,
      amountCents: line.amountCents,
    })
  }

  if (input.payment && paidCents > 0) {
    await insertReceiptPayment(executor, {
      organizationId,
      expenseId,
      supplierId: input.supplierId,
      amountCents: paidCents,
      currency: input.payment.currency,
      paymentDate: input.payment.paymentDate ?? new Date(),
      method: input.payment.method ?? "cash",
      reference: input.payment.reference,
    })
    await updateReceiptPaymentStatus(
      executor,
      organizationId,
      expenseId,
      paymentStatus
    )
  }

  return {
    id: expenseId,
    paymentStatus,
    totalCents,
    paidCents,
  }
}
