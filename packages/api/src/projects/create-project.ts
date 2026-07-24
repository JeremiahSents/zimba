import { projectInputSchema } from "@workspace/contracts"
import type {
  DatabaseExecutor,
  TransactionRunner,
} from "@workspace/db/repositories"
import {
  createAllocation,
  createProject,
  createProjectAttachment,
  findFileForOrganization,
} from "@workspace/db/repositories"
import { z } from "zod"
import { validationError } from "../shared/application-error"
import type { WorkspaceContext } from "../shared/workspace-context"

const createProjectSchema = projectInputSchema.extend({
  landSize: z.string().trim().min(1).max(240),
  buildingType: z.string().trim().min(1).max(120),
  clientName: z.string().trim().max(240).nullable().optional(),
  startDate: z.string().nullable().optional(),
  targetEndDate: z.string().nullable().optional(),
  allocations: z
    .array(
      z.object({
        name: z.string().trim().min(1),
        budget: z.number().positive(),
      })
    )
    .min(1),
  attachmentIds: z.array(z.string()).optional(),
})

export async function createProjectWithAllocationsUseCase(
  ctx: WorkspaceContext,
  deps: { executor: DatabaseExecutor; transaction: TransactionRunner },
  rawInput: unknown
) {
  const input = createProjectSchema.safeParse(rawInput)
  if (!input.success) validationError("Complete every required project field.")
  if (input.data.organizationId !== ctx.organizationId)
    validationError("Organization mismatch.")

  return deps.transaction(async (transaction) => {
    const project = await createProject(transaction, {
      organizationId: ctx.organizationId,
      name: input.data.name,
      location: input.data.location,
      clientName: input.data.clientName ?? null,
      buildingType: input.data.buildingType,
      landSize: input.data.landSize,
      plotSize: input.data.landSize,
      startDate: input.data.startDate ? new Date(input.data.startDate) : null,
      targetEndDate: input.data.targetEndDate
        ? new Date(input.data.targetEndDate)
        : null,
      currency: input.data.currency,
    })
    if (!project) throw new Error("Project insert failed")

    for (const allocation of input.data.allocations) {
      await createAllocation(transaction, {
        organizationId: ctx.organizationId,
        projectId: project.id,
        name: allocation.name,
        budgetCents: Math.round(allocation.budget * 100),
      })
    }

    for (const fileId of input.data.attachmentIds ?? []) {
      const [file] = await findFileForOrganization(
        transaction,
        ctx.organizationId,
        fileId
      )
      if (
        file?.status !== "completed" ||
        file?.purpose !== "project_attachment"
      )
        validationError(
          "An attachment is invalid or belongs to another workspace."
        )
      await createProjectAttachment(transaction, {
        organizationId: ctx.organizationId,
        projectId: project.id,
        fileId,
      })
    }
    return project
  })
}
