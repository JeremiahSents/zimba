import { db } from "@workspace/db"

import { appendAuditEvent } from "@workspace/db/audit"
import { deletePayableForOrganization, deleteReceiptForOrganization } from "@workspace/db/receipts"
import { notFoundError } from "../shared/application-error"
import { requireRole } from "../shared/authorization"
import type { WorkspaceContext } from "../shared/workspace-context"

export async function deleteReceiptUseCase(
  ctx: WorkspaceContext,
  receiptId: string
) {
  requireRole(ctx.role, ["owner", "site_manager", "accountant"])
  return db.transaction(async (tx) => {
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
