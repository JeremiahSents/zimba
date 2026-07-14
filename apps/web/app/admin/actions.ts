"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { requireZimbaApiSession } from "@/lib/api/auth"
import {
  completeFileUpload,
  createExpenseReceipt,
  createProject,
  createUpcomingPayment,
  deleteUpcomingPayment,
  requestFileUpload,
  updateAllocation,
  updateExpense,
  updateProject,
  updateUpcomingPayment,
  ZimbaApiError,
} from "@/lib/api/client"
import { toApiExpenseStatus } from "@/lib/api/normalizers"
import type {
  AllocationUpdate,
  ExpenseReceiptCreate,
  ExpenseStatus,
  FileUploadRequest,
  FileUploadResponse,
  ProjectCreate,
  ProjectUpdate,
  UpcomingPaymentCreate,
  UpcomingPaymentUpdate,
} from "@/lib/types"

type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string }

export async function createProjectAction(
  project: ProjectCreate
): Promise<ActionResult> {
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
    return { ok: false, error: "Complete every required project field." }
  }

  let projectId: number
  try {
    const created = await createProject(await requireZimbaApiSession(), project)
    projectId = created.id
  } catch (error) {
    return actionError(error)
  }

  revalidateConnectedRoutes(projectId)
  redirect(`/admin/projects/${projectId}`)
}

export async function updateProjectAction(
  projectId: number,
  project: ProjectUpdate
): Promise<ActionResult> {
  try {
    await updateProject(await requireZimbaApiSession(), projectId, project)
    revalidateConnectedRoutes(projectId)
    return { ok: true, data: undefined }
  } catch (error) {
    return actionError(error)
  }
}

export async function updateAllocationAction(
  projectId: number,
  allocationId: number,
  allocation: AllocationUpdate
): Promise<ActionResult> {
  try {
    await updateAllocation(
      await requireZimbaApiSession(),
      projectId,
      allocationId,
      allocation
    )
    revalidateConnectedRoutes(projectId)
    return { ok: true, data: undefined }
  } catch (error) {
    return actionError(error)
  }
}

export async function createExpenseReceiptAction(
  projectId: number,
  receipt: ExpenseReceiptCreate
): Promise<ActionResult> {
  if (
    !receipt.expense_date ||
    receipt.items.length === 0 ||
    receipt.items.some(
      (item) =>
        item.allocation_id <= 0 ||
        !item.supplier_name.trim() ||
        !item.item_description.trim() ||
        item.quantity <= 0 ||
        item.unit_rate < 0
    )
  ) {
    return { ok: false, error: "Complete every required receipt field." }
  }

  try {
    await createExpenseReceipt(
      await requireZimbaApiSession(),
      projectId,
      receipt
    )
  } catch (error) {
    return actionError(error)
  }

  revalidateConnectedRoutes(projectId)
  redirect(`/admin/projects/${projectId}`)
}

export async function updateExpenseStatusAction(
  projectId: number,
  expenseId: number,
  status: ExpenseStatus
): Promise<ActionResult> {
  try {
    await updateExpense(await requireZimbaApiSession(), expenseId, {
      payment_status: toApiExpenseStatus(status),
    })
    revalidateConnectedRoutes(projectId)
    return { ok: true, data: undefined }
  } catch (error) {
    return actionError(error)
  }
}

export async function createUpcomingPaymentAction(
  projectId: number,
  payment: UpcomingPaymentCreate
): Promise<ActionResult> {
  if (!payment.title.trim() || payment.amount <= 0 || !payment.due_date) {
    return { ok: false, error: "Add a title, amount, and due date." }
  }

  try {
    await createUpcomingPayment(
      await requireZimbaApiSession(),
      projectId,
      payment
    )
    revalidateConnectedRoutes(projectId)
    return { ok: true, data: undefined }
  } catch (error) {
    return actionError(error)
  }
}

export async function updateUpcomingPaymentAction(
  projectId: number,
  paymentId: number,
  payment: UpcomingPaymentUpdate
): Promise<ActionResult> {
  try {
    await updateUpcomingPayment(
      await requireZimbaApiSession(),
      projectId,
      paymentId,
      payment
    )
    revalidateConnectedRoutes(projectId)
    return { ok: true, data: undefined }
  } catch (error) {
    return actionError(error)
  }
}

export async function deleteUpcomingPaymentAction(
  projectId: number,
  paymentId: number
): Promise<ActionResult> {
  try {
    await deleteUpcomingPayment(
      await requireZimbaApiSession(),
      projectId,
      paymentId
    )
    revalidateConnectedRoutes(projectId)
    return { ok: true, data: undefined }
  } catch (error) {
    return actionError(error)
  }
}

export async function requestFileUploadAction(
  file: FileUploadRequest
): Promise<ActionResult<FileUploadResponse>> {
  if (!file.filename || !file.content_type || file.size_bytes <= 0) {
    return { ok: false, error: "Choose a non-empty file to upload." }
  }

  try {
    const upload = await requestFileUpload(await requireZimbaApiSession(), file)
    return { ok: true, data: upload }
  } catch (error) {
    return actionError(error)
  }
}

export async function completeFileUploadAction(
  fileId: string
): Promise<ActionResult<{ id: string }>> {
  if (!fileId) return { ok: false, error: "The upload is missing its file ID." }

  try {
    const completed = await completeFileUpload(
      await requireZimbaApiSession(),
      fileId
    )
    return { ok: true, data: { id: completed.id } }
  } catch (error) {
    return actionError(error)
  }
}

function actionError(error: unknown): { ok: false; error: string } {
  if (error instanceof ZimbaApiError) return { ok: false, error: error.message }
  if (error instanceof Error && error.message.startsWith("Sign in")) {
    return { ok: false, error: error.message }
  }
  console.error("Zimba API mutation failed", error)
  return {
    ok: false,
    error: "The request could not be completed. Please try again.",
  }
}

function revalidateConnectedRoutes(projectId?: number) {
  revalidatePath("/admin/home")
  revalidatePath("/admin/projects")
  revalidatePath("/admin/expenses")
  revalidatePath("/admin/suppliers")
  revalidatePath("/admin/analytics")
  revalidatePath("/admin/budget")
  revalidatePath("/admin/reports")
  if (projectId) revalidatePath(`/admin/projects/${projectId}`)
}
