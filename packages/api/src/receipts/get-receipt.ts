import type { ReceiptDto } from "@workspace/contracts"
import type { DatabaseExecutor } from "@workspace/db/repositories"
import { findExpenseForOrganization } from "@workspace/db/repositories"
import { notFoundError } from "../shared/application-error"
import type { WorkspaceContext } from "../shared/workspace-context"

export async function getReceipt(
  ctx: WorkspaceContext,
  deps: { executor: DatabaseExecutor },
  receiptId: string
): Promise<ReceiptDto> {
  const result = await findExpenseForOrganization(
    deps.executor,
    ctx.organizationId,
    receiptId
  )
  if (!result) notFoundError("Receipt not found.")

  return {
    id: result.expense.id,
    organizationId: result.expense.organizationId,
    projectId: result.expense.projectId,
    supplierId: result.expense.supplierId,
    paymentStatus: result.expense.paymentStatus,
    lines: result.lines.map(({ line }) => ({
      id: line.id,
      allocationId: line.allocationId,
      itemDescription: line.itemDescription,
      quantity: line.quantity,
      amountCents: line.amountCents,
    })),
  }
}
