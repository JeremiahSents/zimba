"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { ensureActionSession } from "@/core/auth/action-session"
import { getWorkspaceSlug } from "@/core/auth/workspace-slug"
import {
  archiveProject,
  createProject,
  deleteProject,
  restoreProject,
  updateAllocation,
  updateProject,
} from "@/core/projects/mutations"
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
    const created = await createProject(project)
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
    await updateProject(projectId, project)
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
    await updateAllocation(projectId, allocationId, allocation)
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
    await archiveProject(projectId)
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
    await restoreProject(projectId)
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
    await deleteProject(projectId)
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
    const { createAllocation } = await import("@/core/projects/mutations")
    const allocation = await createAllocation(projectId, {
      budget: input.budget,
      name: input.name.trim(),
    })
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
