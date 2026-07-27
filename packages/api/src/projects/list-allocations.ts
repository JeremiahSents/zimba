import { db } from "@workspace/db"

import { findActiveProjectForOrganization, listAllocationsForProject } from "@workspace/db/projects"
import { notFoundError } from "../shared/application-error"
import type { WorkspaceContext } from "../shared/workspace-context"

export async function listProjectAllocationsUseCase(
  ctx: WorkspaceContext,
  projectId: string
) {
  const [project] = await findActiveProjectForOrganization(
    db,
    ctx.organizationId,
    projectId
  )
  if (!project) notFoundError("Project not found.")
  return listAllocationsForProject(db, ctx.organizationId, projectId)
}
