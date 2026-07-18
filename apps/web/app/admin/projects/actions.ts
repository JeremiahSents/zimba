"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { archiveProject, createProject, updateProject, updateAllocation } from "@/core/projects/mutations"
import { ApplicationError } from "@/core/shared/errors"
import type { ActionResult } from "@/core/shared/action-result"
import type { ProjectCreate, ProjectUpdate, AllocationUpdate } from "@/lib/types"
import { requireSession } from "@/core/auth/service"

export async function createProjectAction(
  project: ProjectCreate
): Promise<ActionResult> {
  await requireSession()
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
    return { success: false, error: { code: "bad_request", message: "Complete every required project field." } }
  }

  let projectId: string
  try {
    const created = await createProject(project)
    if (!created) throw new Error("Project could not be created.")
    projectId = created.id
  } catch (error) {
    return actionError(error)
  }

  revalidateConnectedRoutes(projectId)
  redirect(`/admin/projects/${projectId}`)
}

export async function updateProjectAction(
  projectId: string,
  project: ProjectUpdate
): Promise<ActionResult> {
  await requireSession()
  try {
    await updateProject(projectId, project)
    revalidateConnectedRoutes(projectId)
    return { success: true, data: undefined }
  } catch (error) {
    return actionError(error)
  }
}

export async function updateAllocationAction(
  projectId: string,
  allocationId: string,
  allocation: AllocationUpdate
): Promise<ActionResult> {
  await requireSession()
  try {
    await updateAllocation(projectId, allocationId, allocation)
    revalidateConnectedRoutes(projectId)
    return { success: true, data: undefined }
  } catch (error) {
    return actionError(error)
  }
}

export async function archiveProjectAction(projectId: string): Promise<ActionResult> {
  try {
    await archiveProject(projectId)
    revalidateConnectedRoutes(projectId)
  } catch (error) {
    return actionError(error)
  }
  redirect("/admin/projects")
}

export async function createProjectTaskAction(
  projectId: string,
  input: { budget: number; name: string }
): Promise<ActionResult> {
  await requireSession()
  if (!input.name.trim() || !Number.isFinite(input.budget) || input.budget <= 0) {
    return { success: false, error: { code: "bad_request", message: "Add a task name and an initial budget." } }
  }
  
  try {
    const { createAllocation } = await import("@/core/projects/mutations")
    await createAllocation(projectId, { budget: input.budget, name: input.name.trim() })
    revalidateConnectedRoutes(projectId)
    return { success: true, data: undefined }
  } catch (error) {
    return actionError(error)
  }
}

function actionError(error: unknown): { success: false; error: { code: string; message: string } } {
  if (error instanceof ApplicationError) {
    return { success: false, error: { code: error.code, message: error.message } }
  }
  console.error("Zimba Action failed", error)
  return {
    success: false,
    error: { code: "internal_error", message: "The request could not be completed. Please try again." },
  }
}

function revalidateConnectedRoutes(projectId?: string) {
  revalidatePath("/admin/home")
  revalidatePath("/admin/projects")
  revalidatePath("/admin/analytics")
  revalidatePath("/admin/budget")
  revalidatePath("/admin/reports")
  if (projectId) revalidatePath(`/admin/projects/${projectId}`)
  if (projectId) revalidatePath(`/admin/projects/${projectId}/files`)
}
