import type { DatabaseExecutor } from "@workspace/db/repositories"
import {
  createAllocation,
  findActiveProjectForOrganization,
  updateAllocation,
} from "@workspace/db/repositories"
import { z } from "zod"
import { notFoundError, validationError } from "../shared/application-error"
import { requireRole } from "../shared/authorization"
import type { WorkspaceContext } from "../shared/workspace-context"

const allocationSchema = z.object({
  name: z.string().trim().min(1).max(160),
  budget: z.number().finite().positive(),
})

export async function createAllocationUseCase(
  ctx: WorkspaceContext,
  deps: { executor: DatabaseExecutor },
  projectId: string,
  rawInput: unknown
) {
  requireRole(ctx.role, ["owner", "site_manager"])
  const input = allocationSchema.safeParse(rawInput)
  if (!input.success) validationError("Add a task name and an initial budget.")
  const [project] = await findActiveProjectForOrganization(
    deps.executor,
    ctx.organizationId,
    projectId
  )
  if (!project) notFoundError("Project not found.")
  return createAllocation(deps.executor, {
    organizationId: ctx.organizationId,
    projectId,
    name: input.data.name,
    budgetCents: Math.round(input.data.budget * 100),
  })
}

export async function updateAllocationUseCase(
  ctx: WorkspaceContext,
  deps: { executor: DatabaseExecutor },
  projectId: string,
  allocationId: string,
  rawInput: unknown
) {
  requireRole(ctx.role, ["owner", "site_manager"])
  const input = allocationSchema.partial().safeParse(rawInput)
  if (!input.success || (!input.data.name && input.data.budget === undefined))
    validationError("Provide an allocation name or budget.")
  const updated = await updateAllocation(
    deps.executor,
    ctx.organizationId,
    projectId,
    allocationId,
    {
      ...(input.data.name ? { name: input.data.name } : {}),
      ...(input.data.budget !== undefined
        ? { budgetCents: Math.round(input.data.budget * 100) }
        : {}),
    }
  )
  if (!updated) notFoundError("Allocation not found.")
  return updated
}
