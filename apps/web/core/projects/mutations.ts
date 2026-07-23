import "server-only"
import {
  createAllocationUseCase,
  createProjectWithAllocationsUseCase,
  updateAllocationUseCase,
} from "@workspace/api"
import type { WorkspaceRole } from "@workspace/contracts"
import { db } from "@workspace/db"
import type {
  AllocationUpdate,
  ProjectCreate,
  ProjectUpdate,
} from "@/lib/types"
import { recordAudit } from "../audit/service"
import { requireRole } from "../auth/permissions"
import { requireSession } from "../auth/service"
import * as fileRepo from "../files/repository"
import { badRequest } from "../shared/errors"
import * as projectRepo from "./repository"

export async function createProject(data: ProjectCreate) {
  const { user, organization } = await requireSession()
  return createProjectWithAllocationsUseCase(
    {
      userId: user.id,
      organizationId: organization.organizationId,
      role: organization.role as WorkspaceRole,
    },
    { executor: db, transaction: (callback) => db.transaction(callback) },
    {
      organizationId: organization.organizationId,
      name: data.name,
      location: data.location,
      currency: "UGX",
      landSize: data.land_size,
      buildingType: data.building_type,
      clientName: data.client_name,
      startDate: data.start_date,
      targetEndDate: data.target_end_date,
      allocations: data.allocations,
      attachmentIds: data.attachment_ids ?? [],
    }
  )
}

export async function createAllocation(
  projectId: string,
  data: { name: string; budget: number }
) {
  const { user, organization } = await requireSession()
  return createAllocationUseCase(
    {
      userId: user.id,
      organizationId: organization.organizationId,
      role: organization.role as WorkspaceRole,
    },
    { executor: db },
    projectId,
    data
  )
}

export async function updateProject(projectId: string, data: ProjectUpdate) {
  const { user, organization } = await requireSession()
  requireRole(organization.role, ["owner", "site_manager"])

  const project = await projectRepo.updateProject(
    organization.organizationId,
    projectId,
    {
      name: data.name ?? undefined,
      location: data.location ?? undefined,
      clientName: data.client_name ?? undefined,
      buildingType: data.building_type ?? undefined,
      landSize: data.land_size ?? undefined,
      startDate: data.start_date ? new Date(data.start_date) : null,
      targetEndDate: data.target_end_date
        ? new Date(data.target_end_date)
        : null,
      status: data.status ?? undefined,
    }
  )

  for (const fileId of data.attachment_ids ?? []) {
    const file = await fileRepo.getCompletedFile(
      organization.organizationId,
      fileId,
      "project_attachment"
    )
    if (!file)
      badRequest("An attachment is invalid or belongs to another workspace.")
    const attachmentProject = await projectRepo.getProject(
      organization.organizationId,
      projectId
    )
    if (!attachmentProject) badRequest("Project not found.")
    await fileRepo.createProjectAttachment({
      organizationId: organization.organizationId,
      projectId,
      fileId,
    })
  }

  await recordAudit({
    organizationId: organization.organizationId,
    actorId: user.id,
    action: "project.update",
    entityType: "project",
    entityId: projectId,
    changes: data,
  })

  return project
}

export async function updateAllocation(
  projectId: string,
  allocationId: string,
  data: AllocationUpdate
) {
  const { user, organization } = await requireSession()
  return updateAllocationUseCase(
    {
      userId: user.id,
      organizationId: organization.organizationId,
      role: organization.role as WorkspaceRole,
    },
    { executor: db },
    projectId,
    allocationId,
    { name: data.name ?? undefined, budget: data.budget ?? undefined }
  )
}

export async function archiveProject(projectId: string) {
  const { user, organization } = await requireSession()
  requireRole(organization.role, ["owner"])
  const project = await projectRepo.updateProject(
    organization.organizationId,
    projectId,
    { archivedAt: new Date(), archivedBy: user.id }
  )
  if (!project) badRequest("Project could not be archived.")
  await recordAudit({
    organizationId: organization.organizationId,
    actorId: user.id,
    action: "project.archive",
    entityType: "project",
    entityId: projectId,
  })
  return project
}

export async function restoreProject(projectId: string) {
  const { user, organization } = await requireSession()
  requireRole(organization.role, ["owner"])
  const project = await projectRepo.updateProject(
    organization.organizationId,
    projectId,
    { archivedAt: null, archivedBy: null }
  )
  if (!project) badRequest("Project could not be restored.")
  await recordAudit({
    organizationId: organization.organizationId,
    actorId: user.id,
    action: "project.restore",
    entityType: "project",
    entityId: projectId,
  })
  return project
}

export async function deleteProject(projectId: string) {
  const { user, organization } = await requireSession()
  requireRole(organization.role, ["owner"])
  const project = await projectRepo.deleteProject(
    organization.organizationId,
    projectId
  )
  if (!project) badRequest("Project could not be deleted.")
  await recordAudit({
    organizationId: organization.organizationId,
    actorId: user.id,
    action: "project.delete",
    entityType: "project",
    entityId: projectId,
    changes: { name: project.name },
  })
  return project
}
