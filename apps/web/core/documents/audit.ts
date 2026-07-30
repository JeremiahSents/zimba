import "server-only"

import { recordAuditUseCase } from "@workspace/api"
import { requireWorkspaceContext } from "@/core/auth/service"

/**
 * Records that a generated document was emailed. Kept out of the send itself so
 * a failure to write history can never be the reason a customer's supplier does
 * not get their receipt — the send has already happened by the time this runs.
 */
export async function recordDocumentEmailAudit(input: {
  kind: "receipt" | "payment_voucher"
  targetId: string
  recipient: "self" | "supplier"
  email: string
}) {
  const ctx = await requireWorkspaceContext()
  return recordAuditUseCase(ctx, {
    action:
      input.kind === "receipt"
        ? "receipt.document_emailed"
        : "payment.document_emailed",
    entityType: input.kind === "receipt" ? "expense" : "payment",
    entityId: input.targetId,
    changes: { recipient: input.recipient, email: input.email },
  })
}
