import "server-only"
import { requireSession } from "../auth/service"
import * as projectRepo from "./repository"
import * as allocationRepo from "../allocations/repository"
import * as fileRepo from "../files/repository"
import { badRequest } from "../shared/errors"
import type { ProjectCreate, ProjectUpdate, AllocationUpdate } from "@/lib/types"

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
    const file = await fileRepo.getCompletedFile(organization.organizationId, fileId)
    if (!file) badRequest("An attachment is invalid or belongs to another workspace.")
    await fileRepo.createProjectAttachment({ organizationId: organization.organizationId, projectId: project.id, fileId })
  }

  return project
}

export async function createAllocation(projectId: string, data: { name: string; budget: number }) {
  const { organization } = await requireSession()
  
  const allocation = await allocationRepo.createAllocation({
    organizationId: organization.organizationId,
    projectId,
    name: data.name,
    budgetCents: Math.round(data.budget * 100),
  })

  return allocation
}

export async function updateProject(projectId: string, data: ProjectUpdate) {
  const { organization } = await requireSession()
  
  const project = await projectRepo.updateProject(organization.organizationId, projectId, {
    name: data.name ?? undefined,
    location: data.location ?? undefined,
    clientName: data.client_name ?? undefined,
    buildingType: data.building_type ?? undefined,
    landSize: data.land_size ?? undefined,
    startDate: data.start_date ? new Date(data.start_date) : null,
    targetEndDate: data.target_end_date ? new Date(data.target_end_date) : null,
  })

  return project
}

export async function updateAllocation(projectId: string, allocationId: string, data: AllocationUpdate) {
  const { organization } = await requireSession()
  
  const allocation = await allocationRepo.updateAllocation(organization.organizationId, projectId, allocationId, {
    name: data.name ?? undefined,
    budgetCents: data.budget ? Math.round(data.budget * 100) : undefined,
  })

  return allocation
}
