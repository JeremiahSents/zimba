import type {
  DatabaseExecutor,
  TransactionRunner,
} from "@workspace/db/repositories"
import {
  appendAuditEvent,
  findAllocationForProject,
  findExpenseForOrganization,
  findPayableForOrganization,
  insertReceipt,
  insertReceiptLine,
  updateReceiptLinesAllocation,
} from "@workspace/db/repositories"
import { notFoundError, validationError } from "../shared/application-error"
import { requireRole } from "../shared/authorization"
import type { WorkspaceContext } from "../shared/workspace-context"

export async function correctReceiptCategoryUseCase(
  ctx: WorkspaceContext,
  deps: { executor: DatabaseExecutor; transaction: TransactionRunner },
  receiptId: string,
  allocationId: string
) {
  requireRole(ctx.role, ["owner", "site_manager", "accountant"])
  if (!receiptId || !allocationId) validationError("Select a category.")
  return deps.transaction(async (tx) => {
    const existing = await findExpenseForOrganization(
      tx,
      ctx.organizationId,
      receiptId
    )
    const payable = existing
      ? null
      : await findPayableForOrganization(tx, ctx.organizationId, receiptId)
    const projectId = existing?.expense.projectId ?? payable?.payable.projectId
    if (!projectId) notFoundError("Receipt not found.")
    const [allocation] = await findAllocationForProject(
      tx,
      ctx.organizationId,
      projectId,
      allocationId
    )
    if (!allocation) notFoundError("Allocation not found in this workspace.")
    if (existing) {
      await updateReceiptLinesAllocation(
        tx,
        ctx.organizationId,
        receiptId,
        allocationId
      )
    } else if (payable) {
      await insertReceipt(tx, {
        id: payable.payable.id,
        organizationId: ctx.organizationId,
        projectId: payable.payable.projectId,
        supplierId: payable.payable.supplierId,
        paymentStatus: payable.payable.status,
        expenseDate: payable.payable.dueDate ?? payable.payable.createdAt,
      })
      await insertReceiptLine(tx, {
        organizationId: ctx.organizationId,
        expenseId: payable.payable.id,
        allocationId,
        legacyAllocationId: allocationId,
        itemDescription: payable.payable.description || payable.payable.title,
        quantity: 1,
        unitRateCents: payable.payable.amountCents,
        amountCents: payable.payable.amountCents,
      })
    }
    await appendAuditEvent(tx, {
      organizationId: ctx.organizationId,
      actorId: ctx.userId,
      action: "receipt.category.correct",
      entityType: "receipt",
      entityId: receiptId,
      changes: { allocationId },
    })
    return { receiptId, allocationId }
  })
}
