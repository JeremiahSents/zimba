import type { TransactionRunner } from "@workspace/db/repositories"
import {
  appendAuditEvent,
  createProjectAttachment,
  deleteProjectForOrganization,
  findActiveProjectForOrganization,
  findFileForOrganization,
  updateProjectForOrganization,
} from "@workspace/db/repositories"
import { z } from "zod"
import { notFoundError, validationError } from "../shared/application-error"
import { requireRole } from "../shared/authorization"
import type { WorkspaceContext } from "../shared/workspace-context"

const updateProjectSchema = z.object({
  name: z.string().trim().min(1).max(240).optional(),
  location: z.string().trim().min(1).max(240).optional(),
  clientName: z.string().trim().max(240).nullable().optional(),
  buildingType: z.string().trim().min(1).max(120).optional(),
  landSize: z.string().trim().min(1).max(240).optional(),
  startDate: z.string().nullable().optional(),
  targetEndDate: z.string().nullable().optional(),
  status: z.enum(["active", "archived"]).optional(),
  attachmentIds: z.array(z.string().min(1)).optional(),
})

export async function updateProjectUseCase(
  ctx: WorkspaceContext,
  deps: { transaction: TransactionRunner },
  projectId: string,
  rawInput: unknown
) {
  requireRole(ctx.role, ["owner", "site_manager"])
  const input = updateProjectSchema.safeParse(rawInput)
  if (!input.success) validationError("Invalid project input.")

  return deps.transaction(async (transaction) => {
    const [existing] = await findActiveProjectForOrganization(
      transaction,
      ctx.organizationId,
      projectId
    )
    if (!existing) notFoundError("Project not found.")

    const updated = await updateProjectForOrganization(
      transaction,
      ctx.organizationId,
      projectId,
      {
        ...(input.data.name ? { name: input.data.name } : {}),
        ...(input.data.location ? { location: input.data.location } : {}),
        ...(input.data.clientName !== undefined
          ? { clientName: input.data.clientName }
          : {}),
        ...(input.data.buildingType
          ? { buildingType: input.data.buildingType }
          : {}),
        ...(input.data.landSize
          ? { landSize: input.data.landSize, plotSize: input.data.landSize }
          : {}),
        ...(input.data.startDate !== undefined
          ? {
              startDate: input.data.startDate
                ? new Date(input.data.startDate)
                : null,
            }
          : {}),
        ...(input.data.targetEndDate !== undefined
          ? {
              targetEndDate: input.data.targetEndDate
                ? new Date(input.data.targetEndDate)
                : null,
            }
          : {}),
        ...(input.data.status ? { status: input.data.status } : {}),
      }
    )
    if (!updated) notFoundError("Project not found.")

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
      const attachment = await createProjectAttachment(transaction, {
        organizationId: ctx.organizationId,
        projectId,
        fileId,
      })
      if (!attachment)
        validationError(
          "An attachment is invalid or belongs to another workspace."
        )
    }

    await appendAuditEvent(transaction, {
      organizationId: ctx.organizationId,
      actorId: ctx.userId,
      action: "project.update",
      entityType: "project",
      entityId: projectId,
      changes: input.data,
    })

    return updated
  })
}

export async function archiveProjectUseCase(
  ctx: WorkspaceContext,
  deps: { transaction: TransactionRunner },
  projectId: string
) {
  requireRole(ctx.role, ["owner"])
  return setProjectArchivedState(ctx, deps, projectId, true)
}

export async function restoreProjectUseCase(
  ctx: WorkspaceContext,
  deps: { transaction: TransactionRunner },
  projectId: string
) {
  requireRole(ctx.role, ["owner"])
  return setProjectArchivedState(ctx, deps, projectId, false)
}

export async function deleteProjectUseCase(
  ctx: WorkspaceContext,
  deps: { transaction: TransactionRunner },
  projectId: string
) {
  requireRole(ctx.role, ["owner"])
  return deps.transaction(async (transaction) => {
    const deleted = await deleteProjectForOrganization(
      transaction,
      ctx.organizationId,
      projectId
    )
    if (!deleted) notFoundError("Project not found.")
    await appendAuditEvent(transaction, {
      organizationId: ctx.organizationId,
      actorId: ctx.userId,
      action: "project.delete",
      entityType: "project",
      entityId: projectId,
      changes: { name: deleted.name },
    })
    return deleted
  })
}

async function setProjectArchivedState(
  ctx: WorkspaceContext,
  deps: { transaction: TransactionRunner },
  projectId: string,
  archived: boolean
) {
  return deps.transaction(async (transaction) => {
    const updated = await updateProjectForOrganization(
      transaction,
      ctx.organizationId,
      projectId,
      archived
        ? { archivedAt: new Date(), archivedBy: ctx.userId, status: "archived" }
        : { archivedAt: null, archivedBy: null, status: "active" }
    )
    if (!updated) notFoundError("Project not found.")
    await appendAuditEvent(transaction, {
      organizationId: ctx.organizationId,
      actorId: ctx.userId,
      action: archived ? "project.archive" : "project.restore",
      entityType: "project",
      entityId: projectId,
    })
    return updated
  })
}
