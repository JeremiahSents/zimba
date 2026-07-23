import type { DatabaseExecutor } from "@workspace/db/repositories"
import {
  findActiveProjectForOrganization,
  listAllocationsForProject,
} from "@workspace/db/repositories"
import { notFoundError } from "../shared/application-error"
import type { WorkspaceContext } from "../shared/workspace-context"

export async function listProjectAllocationsUseCase(
  ctx: WorkspaceContext,
  deps: { executor: DatabaseExecutor },
  projectId: string
) {
  const [project] = await findActiveProjectForOrganization(
    deps.executor,
    ctx.organizationId,
    projectId
  )
  if (!project) notFoundError("Project not found.")
  return listAllocationsForProject(deps.executor, ctx.organizationId, projectId)
}
