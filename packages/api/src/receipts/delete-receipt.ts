import type {
  DatabaseExecutor,
  TransactionRunner,
} from "@workspace/db/repositories"
import {
  appendAuditEvent,
  deletePayableForOrganization,
  deleteReceiptForOrganization,
} from "@workspace/db/repositories"
import { notFoundError } from "../shared/application-error"
import { requireRole } from "../shared/authorization"
import type { WorkspaceContext } from "../shared/workspace-context"

export async function deleteReceiptUseCase(
  ctx: WorkspaceContext,
  deps: { executor: DatabaseExecutor; transaction: TransactionRunner },
  receiptId: string
) {
  requireRole(ctx.role, ["owner", "site_manager", "accountant"])
  return deps.transaction(async (tx) => {
    const [expense] = await deleteReceiptForOrganization(
      tx,
      ctx.organizationId,
      receiptId
    )
    const payable = await deletePayableForOrganization(
      tx,
      ctx.organizationId,
      receiptId
    )
    if (!expense && !payable) notFoundError("Receipt not found.")
    await appendAuditEvent(tx, {
      organizationId: ctx.organizationId,
      actorId: ctx.userId,
      action: "receipt.delete",
      entityType: "receipt",
      entityId: receiptId,
    })
    return expense ?? payable
  })
}
