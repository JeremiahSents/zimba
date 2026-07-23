import type { DatabaseExecutor } from "@workspace/db/repositories"
import { listExpensesForOrganization } from "@workspace/db/repositories"
import type { WorkspaceContext } from "../shared/workspace-context"

export async function listReceipts(
  ctx: WorkspaceContext,
  deps: { executor: DatabaseExecutor },
  projectId?: string
) {
  return listExpensesForOrganization(
    deps.executor,
    ctx.organizationId,
    projectId
  )
}
