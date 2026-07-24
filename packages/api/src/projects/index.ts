import type { ProjectDto } from "@workspace/contracts"
import { projectInputSchema } from "@workspace/contracts"
import type { DatabaseExecutor } from "@workspace/db/repositories"
import {
  createProject,
  listProjectsForOrganization,
} from "@workspace/db/repositories"
import { validationError } from "../shared/application-error"
import type { WorkspaceContext } from "../shared/workspace-context"

export async function createProjectUseCase(
  ctx: WorkspaceContext,
  deps: { executor: DatabaseExecutor },
  rawInput: unknown
): Promise<ProjectDto> {
  const input = projectInputSchema.parse(rawInput)
  if (input.organizationId !== ctx.organizationId)
    validationError("Organization mismatch.")
  const created = await createProject(deps.executor, {
    organizationId: ctx.organizationId,
    name: input.name,
    location: input.location,
    currency: input.currency,
  })
  if (!created) throw new Error("Project insert failed")
  return {
    id: created.id,
    organizationId: created.organizationId,
    name: created.name,
    location: created.location,
    status: created.status,
    currency: created.currency,
  }
}

export async function listProjectsUseCase(
  ctx: WorkspaceContext,
  deps: { executor: DatabaseExecutor }
): Promise<ProjectDto[]> {
  const rows = await listProjectsForOrganization(
    deps.executor,
    ctx.organizationId
  )
  return rows.map((row) => ({
    id: row.id,
    organizationId: row.organizationId,
    name: row.name,
    location: row.location,
    status: row.status,
    currency: row.currency,
  }))
}
