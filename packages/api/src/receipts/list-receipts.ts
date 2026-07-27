import { db } from "@workspace/db"

import { listExpensesForOrganization } from "@workspace/db/repositories"
import type { WorkspaceContext } from "../shared/workspace-context"

export async function listReceipts(ctx: WorkspaceContext, projectId?: string) {
  return listExpensesForOrganization(db, ctx.organizationId, projectId)
}
