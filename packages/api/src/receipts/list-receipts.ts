import { db } from "@workspace/db"

import { listExpensesForOrganization } from "@workspace/db/receipts"
import type { WorkspaceContext } from "../shared/workspace-context"

export async function listReceipts(ctx: WorkspaceContext, projectId?: string) {
  return listExpensesForOrganization(db, ctx.organizationId, projectId)
}
