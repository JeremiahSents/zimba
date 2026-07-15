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
import { isMockDataMode } from "@/lib/api/data-mode"
import {
  completeMockFileUpload,
  createMockExpenseReceipt,
  createMockProject,
  createMockSupplier,
  createMockUpcomingPayment,
  deleteMockUpcomingPayment,
  MockRepositoryError,
  requestMockFileUpload,
  updateMockAllocation,
  updateMockExpenseStatus,
  updateMockProject,
  updateMockUpcomingPayment,
} from "@/lib/api/mock-repository"
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
    const session = await requireZimbaApiSession()
    const created = isMockDataMode()
      ? createMockProject(session.organizationId, project)
      : await createProject(session, project)
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
    const session = await requireZimbaApiSession()
    if (isMockDataMode()) {
      updateMockProject(session.organizationId, projectId, project)
    } else {
      await updateProject(session, projectId, project)
    }
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
    const session = await requireZimbaApiSession()
    if (isMockDataMode()) {
      updateMockAllocation(
        session.organizationId,
        projectId,
        allocationId,
        allocation
      )
    } else {
      await updateAllocation(session, projectId, allocationId, allocation)
    }
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
    const session = await requireZimbaApiSession()
    if (isMockDataMode()) {
      createMockExpenseReceipt(session.organizationId, projectId, receipt)
    } else {
      await createExpenseReceipt(session, projectId, receipt)
    }
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
    const session = await requireZimbaApiSession()
    if (isMockDataMode()) {
      updateMockExpenseStatus(
        session.organizationId,
        projectId,
        expenseId,
        status
      )
    } else {
      await updateExpense(session, expenseId, {
        payment_status: toApiExpenseStatus(status),
      })
    }
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
    const session = await requireZimbaApiSession()
    if (isMockDataMode()) {
      createMockUpcomingPayment(session.organizationId, projectId, payment)
    } else {
      await createUpcomingPayment(session, projectId, payment)
    }
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
    const session = await requireZimbaApiSession()
    if (isMockDataMode()) {
      updateMockUpcomingPayment(
        session.organizationId,
        projectId,
        paymentId,
        payment
      )
    } else {
      await updateUpcomingPayment(session, projectId, paymentId, payment)
    }
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
    const session = await requireZimbaApiSession()
    if (isMockDataMode()) {
      deleteMockUpcomingPayment(session.organizationId, projectId, paymentId)
    } else {
      await deleteUpcomingPayment(session, projectId, paymentId)
    }
    revalidateConnectedRoutes(projectId)
    return { ok: true, data: undefined }
  } catch (error) {
    return actionError(error)
  }
}

export async function createSupplierAction(input: {
  name: string
  category: "materials" | "labour" | "equipment" | "services" | "other"
  companyContact?: string
  contactName?: string
  phone?: string
  email?: string
  notes?: string
}): Promise<ActionResult<{ persistence: "mock" | "client" }>> {
  if (!input.name.trim()) {
    return { ok: false, error: "Add a supplier name." }
  }

  try {
    if (!isMockDataMode()) {
      return { ok: true, data: { persistence: "client" } }
    }

    const session = await requireZimbaApiSession()
    createMockSupplier(session.organizationId, {
      ...input,
      name: input.name.trim(),
    })
    revalidatePath("/admin/suppliers")
    return { ok: true, data: { persistence: "mock" } }
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
    const session = await requireZimbaApiSession()
    const upload = isMockDataMode()
      ? requestMockFileUpload(session.organizationId, file)
      : await requestFileUpload(session, file)
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
    const session = await requireZimbaApiSession()
    const completed = isMockDataMode()
      ? completeMockFileUpload(session.organizationId, fileId)
      : await completeFileUpload(session, fileId)
    return { ok: true, data: { id: completed.id } }
  } catch (error) {
    return actionError(error)
  }
}

function actionError(error: unknown): { ok: false; error: string } {
  if (error instanceof ZimbaApiError) return { ok: false, error: error.message }
  if (error instanceof MockRepositoryError) {
    return { ok: false, error: error.message }
  }
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
