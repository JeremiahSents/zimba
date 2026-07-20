import "server-only"
import type {
  AllocationUpdate,
  ProjectCreate,
  ProjectUpdate,
} from "@/lib/types"
import * as allocationRepo from "../allocations/repository"
import { recordAudit } from "../audit/service"
import { requireRole } from "../auth/permissions"
import { requireSession } from "../auth/service"
import * as fileRepo from "../files/repository"
import { badRequest } from "../shared/errors"
import * as projectRepo from "./repository"

export async function createProject(data: ProjectCreate) {
  const { organization } = await requireSession()

  const project = await projectRepo.createProject({
    organizationId: organization.organizationId,
    name: data.name,
    location: data.location,
    clientName: data.client_name,
    buildingType: data.building_type,
    landSize: data.land_size,
    plotSize: data.land_size,
    startDate: data.start_date ? new Date(data.start_date) : null,
    targetEndDate: data.target_end_date ? new Date(data.target_end_date) : null,
  })
  if (!project) throw new Error("Project insert failed")

  if (data.allocations && data.allocations.length > 0) {
    for (const alloc of data.allocations) {
      await allocationRepo.createAllocation({
        organizationId: organization.organizationId,
        projectId: project.id,
        name: alloc.name,
        budgetCents: Math.round(alloc.budget * 100),
      })
    }
  }
  for (const fileId of data.attachment_ids ?? []) {
    const file = await fileRepo.getCompletedFile(
      organization.organizationId,
      fileId
    )
    if (!file)
      badRequest("An attachment is invalid or belongs to another workspace.")
    await fileRepo.createProjectAttachment({
      organizationId: organization.organizationId,
      projectId: project.id,
      fileId,
    })
  }

  return project
}

export async function createAllocation(
  projectId: string,
  data: { name: string; budget: number }
) {
  const { organization } = await requireSession()

  const project = await projectRepo.getProject(
    organization.organizationId,
    projectId
  )
  if (!project) badRequest("Project not found.")

  const allocation = await allocationRepo.createAllocation({
    organizationId: organization.organizationId,
    projectId,
    name: data.name,
    budgetCents: Math.round(data.budget * 100),
  })

  return allocation
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
      fileId
    )
    if (!file)
      badRequest("An attachment is invalid or belongs to another workspace.")
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
  const { organization } = await requireSession()
  requireRole(organization.role, ["owner", "site_manager"])

  const allocation = await allocationRepo.updateAllocation(
    organization.organizationId,
    projectId,
    allocationId,
    {
      name: data.name ?? undefined,
      budgetCents: data.budget ? Math.round(data.budget * 100) : undefined,
    }
  )

  return allocation
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
