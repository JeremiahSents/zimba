import "server-only"
import {
  archiveProjectUseCase,
  createAllocationUseCase,
  createProjectWithAllocationsUseCase,
  deleteProjectUseCase,
  restoreProjectUseCase,
  updateAllocationUseCase,
  updateProjectUseCase,
} from "@workspace/api"
import type { WorkspaceRole } from "@workspace/contracts"
import { db } from "@workspace/db"
import type {
  AllocationUpdate,
  ProjectCreate,
  ProjectUpdate,
} from "@/lib/types"
import { requireSession } from "../auth/service"

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
  return updateProjectUseCase(
    {
      userId: user.id,
      organizationId: organization.organizationId,
      role: organization.role as WorkspaceRole,
    },
    { transaction: (callback) => db.transaction(callback) },
    projectId,
    {
      name: data.name ?? undefined,
      location: data.location ?? undefined,
      clientName: data.client_name ?? undefined,
      buildingType: data.building_type ?? undefined,
      landSize: data.land_size ?? undefined,
      startDate: data.start_date ?? undefined,
      targetEndDate: data.target_end_date ?? undefined,
      status: data.status ?? undefined,
      attachmentIds: data.attachment_ids ?? undefined,
    }
  )
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
  return archiveProjectUseCase(
    {
      userId: user.id,
      organizationId: organization.organizationId,
      role: organization.role as WorkspaceRole,
    },
    { transaction: (callback) => db.transaction(callback) },
    projectId
  )
}

export async function restoreProject(projectId: string) {
  const { user, organization } = await requireSession()
  return restoreProjectUseCase(
    {
      userId: user.id,
      organizationId: organization.organizationId,
      role: organization.role as WorkspaceRole,
    },
    { transaction: (callback) => db.transaction(callback) },
    projectId
  )
}

export async function deleteProject(projectId: string) {
  const { user, organization } = await requireSession()
  return deleteProjectUseCase(
    {
      userId: user.id,
      organizationId: organization.organizationId,
      role: organization.role as WorkspaceRole,
    },
    { transaction: (callback) => db.transaction(callback) },
    projectId
  )
}
