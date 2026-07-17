import "server-only"
import { requireSession } from "../auth/service"
import * as projectRepo from "./repository"
import * as allocationRepo from "../allocations/repository"
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
    plotSize: data.plot_size,
    startDate: data.start_date ? new Date(data.start_date) : null,
    targetEndDate: data.target_end_date ? new Date(data.target_end_date) : null,
    status: data.status,
    currency: data.currency,
  })

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
    name: data.name,
    location: data.location,
    clientName: data.client_name,
    buildingType: data.building_type,
    landSize: data.land_size,
    plotSize: data.plot_size,
    startDate: data.start_date ? new Date(data.start_date) : null,
    targetEndDate: data.target_end_date ? new Date(data.target_end_date) : null,
    status: data.status,
    currency: data.currency,
  })

  return project
}

export async function updateAllocation(projectId: string, allocationId: string, data: AllocationUpdate) {
  const { organization } = await requireSession()
  
  const allocation = await allocationRepo.updateAllocation(organization.organizationId, allocationId, {
    name: data.name,
    budgetCents: data.budget ? Math.round(data.budget * 100) : undefined,
  })

  return allocation
}
