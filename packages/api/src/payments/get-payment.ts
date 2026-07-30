import { db } from "@workspace/db"
import { findPaymentForOrganization } from "@workspace/db/receipts"
import type { WorkspaceContext } from "../shared/workspace-context"

/**
 * A single payment with whatever it settles — an expense or a payable — plus
 * the sibling payments needed to state the balance the voucher reports.
 * Returns null rather than throwing so callers that generate documents
 * opportunistically can skip a row that has since been deleted.
 */
export function getPaymentDetailUseCase(
  ctx: Pick<WorkspaceContext, "organizationId">,
  paymentId: string
) {
  if (!paymentId.trim()) return Promise.resolve(null)
  return findPaymentForOrganization(db, ctx.organizationId, paymentId)
}
