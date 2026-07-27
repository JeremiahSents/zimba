"use server"

import {
  archiveProjectUseCase,
  createAllocationUseCase,
  createProjectWithAllocationsUseCase,
  deleteProjectUseCase,
  restoreProjectUseCase,
  updateAllocationUseCase,
  updateProjectUseCase,
} from "@workspace/api"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { ensureActionSession } from "@/core/auth/action-session"
import { requireWorkspaceContext } from "@/core/auth/service"
import { getWorkspaceSlug } from "@/core/auth/workspace-slug"
import {
  type ActionResult,
  expectedActionFailure,
} from "@/core/shared/action-result"
import { handleActionError } from "@/core/shared/handle-action-error"
import type {
  AllocationUpdate,
  ProjectCreate,
  ProjectUpdate,
} from "@/lib/types"

type ProjectTaskActionResult = {
  id: string
  name: string
  budget: number
  spent: number
  pct: number
}

export async function createProjectAction(
  project: ProjectCreate
): Promise<ActionResult> {
  const authFailure = await ensureActionSession("projects.create")
  if (authFailure) return authFailure
  if (
    !project.name.trim() ||
    !project.location.trim() ||
    !project.land_size.trim() ||
    !project.building_type ||
    project.allocations.length === 0 ||
    project.allocations.some(
      (allocation) => !allocation.name.trim() || allocation.budget <= 0
    )
  ) {
    return expectedActionFailure(
      "VALIDATION_FAILED",
      "Complete every required project field."
    )
  }

  let projectId: string
  try {
    const ctx = await requireWorkspaceContext()
    const created = await createProjectWithAllocationsUseCase(ctx, {
      organizationId: ctx.organizationId,
      name: project.name,
      location: project.location,
      currency: "UGX",
      landSize: project.land_size,
      buildingType: project.building_type,
      clientName: project.client_name,
      startDate: project.start_date,
      targetEndDate: project.target_end_date,
      allocations: project.allocations,
      attachmentIds: project.attachment_ids ?? [],
    })
    if (!created) throw new Error("Project could not be created.")
    projectId = created.id
  } catch (error) {
    return handleActionError(error, "projects.create")
  }

  revalidateConnectedRoutes(projectId)
  const slug = await getWorkspaceSlug()
  redirect(`/${slug}/projects/${projectId}`)
}

export async function updateProjectAction(
  projectId: string,
  project: ProjectUpdate
): Promise<ActionResult> {
  const authFailure = await ensureActionSession("projects.update")
  if (authFailure) return authFailure
  try {
    await updateProjectUseCase(await requireWorkspaceContext(), projectId, {
      name: project.name ?? undefined,
      location: project.location ?? undefined,
      clientName: project.client_name ?? undefined,
      buildingType: project.building_type ?? undefined,
      landSize: project.land_size ?? undefined,
      startDate: project.start_date ?? undefined,
      targetEndDate: project.target_end_date ?? undefined,
      status: project.status ?? undefined,
      attachmentIds: project.attachment_ids ?? undefined,
    })
    revalidateConnectedRoutes(projectId)
    return { success: true, data: undefined }
  } catch (error) {
    return handleActionError(error, "projects.update")
  }
}

export async function updateAllocationAction(
  projectId: string,
  allocationId: string,
  allocation: AllocationUpdate
): Promise<ActionResult> {
  const authFailure = await ensureActionSession("allocations.update")
  if (authFailure) return authFailure
  try {
    await updateAllocationUseCase(
      await requireWorkspaceContext(),
      projectId,
      allocationId,
      {
        name: allocation.name ?? undefined,
        budget: allocation.budget ?? undefined,
      }
    )
    revalidateConnectedRoutes(projectId)
    return { success: true, data: undefined }
  } catch (error) {
    return handleActionError(error, "allocations.update")
  }
}

export async function archiveProjectAction(
  projectId: string
): Promise<ActionResult> {
  const authFailure = await ensureActionSession("projects.archive")
  if (authFailure) return authFailure
  try {
    await archiveProjectUseCase(await requireWorkspaceContext(), projectId)
    revalidateConnectedRoutes(projectId)
  } catch (error) {
    return handleActionError(error, "projects.archive")
  }
  const slug = await getWorkspaceSlug()
  redirect(`/${slug}/projects`)
}

export async function restoreProjectAction(
  projectId: string
): Promise<ActionResult> {
  const authFailure = await ensureActionSession("projects.restore")
  if (authFailure) return authFailure
  try {
    await restoreProjectUseCase(await requireWorkspaceContext(), projectId)
    revalidateConnectedRoutes(projectId)
    return { success: true, data: undefined }
  } catch (error) {
    return handleActionError(error, "projects.restore")
  }
}

export async function deleteProjectAction(
  projectId: string
): Promise<ActionResult> {
  const authFailure = await ensureActionSession("projects.delete")
  if (authFailure) return authFailure
  try {
    await deleteProjectUseCase(await requireWorkspaceContext(), projectId)
    revalidateConnectedRoutes(projectId)
    return { success: true, data: undefined }
  } catch (error) {
    return handleActionError(error, "projects.delete")
  }
}

export async function createProjectTaskAction(
  projectId: string,
  input: { budget: number; name: string }
): Promise<ActionResult<ProjectTaskActionResult>> {
  const authFailure = await ensureActionSession("allocations.create")
  if (authFailure) return authFailure
  if (
    !input.name.trim() ||
    !Number.isFinite(input.budget) ||
    input.budget <= 0
  ) {
    return expectedActionFailure(
      "VALIDATION_FAILED",
      "Add a task name and an initial budget."
    )
  }

  try {
    const allocation = await createAllocationUseCase(
      await requireWorkspaceContext(),
      projectId,
      { budget: input.budget, name: input.name.trim() }
    )
    if (!allocation) throw new Error("Allocation could not be created.")
    revalidateConnectedRoutes(projectId)
    return {
      success: true,
      data: {
        id: allocation.id,
        name: allocation.name,
        budget: allocation.budgetCents / 100,
        spent: 0,
        pct: 0,
      },
    }
  } catch (error) {
    return handleActionError(error, "allocations.create")
  }
}

async function revalidateConnectedRoutes(projectId?: string) {
  const slug = await getWorkspaceSlug()
  revalidatePath(`/${slug}/home`)
  revalidatePath(`/${slug}/projects`)
  revalidatePath(`/${slug}/analytics`)
  revalidatePath(`/${slug}/budget`)
  revalidatePath(`/${slug}/reports`)
  if (projectId) revalidatePath(`/${slug}/projects/${projectId}`)
  if (projectId) revalidatePath(`/${slug}/projects/${projectId}/files`)
}
