import "server-only"

import {
  mockProjectDetails,
  mockSpendChart,
  mockSuppliers,
  mockUtilizationChart,
} from "@/lib/api/mock-data"
import { toUiExpenseStatus } from "@/lib/api/normalizers"
import type {
  AllocationUpdate,
  DashboardOverviewData,
  ExpenseReceiptCreate,
  ExpenseResponse,
  ExpenseStatus,
  FileUploadRequest,
  FileUploadResponse,
  ProjectCreate,
  ProjectDetailResponse,
  ProjectUpdate,
  SupplierResponse,
  UpcomingPaymentCreate,
  UpcomingPaymentResponse,
  UpcomingPaymentUpdate,
} from "@/lib/types"

type MockUpload = FileUploadRequest & { id: string }

type MockWorkspace = {
  projects: ProjectDetailResponse[]
  suppliers: SupplierResponse[]
  uploads: Map<string, MockUpload>
}

type MockRepositoryState = Map<string, MockWorkspace>

export class MockRepositoryError extends Error {
  override name = "MockRepositoryError"
}

const globalForMockRepository = globalThis as typeof globalThis & {
  __zimbaMockRepository?: MockRepositoryState
}

const workspaces =
  globalForMockRepository.__zimbaMockRepository ??
  new Map<string, MockWorkspace>()

if (process.env.NODE_ENV !== "production") {
  globalForMockRepository.__zimbaMockRepository = workspaces
}

function clone<T>(value: T): T {
  return structuredClone(value)
}

function seedWorkspace(): MockWorkspace {
  const projects = clone(mockProjectDetails).map((project, index) => {
    const allocations = project.tasks.map((task, taskIndex) => {
      const priorBudget = project.tasks
        .slice(0, taskIndex)
        .reduce((sum, item) => sum + item.budget, 0)
      const budget =
        taskIndex === project.tasks.length - 1
          ? project.budget - priorBudget
          : task.budget
      return {
        budget,
        id: task.id,
        name: task.name,
        remaining: Math.max(budget - task.spent, 0),
        spent: task.spent,
        utilization_pct: budget ? Math.round((task.spent / budget) * 100) : 0,
      }
    })
    const unallocatedSpend =
      project.spent -
      allocations.reduce((sum, allocation) => sum + allocation.spent, 0)
    if (allocations[0] && unallocatedSpend) {
      allocations[0].spent += unallocatedSpend
      allocations[0].remaining = Math.max(
        allocations[0].budget - allocations[0].spent,
        0
      )
      allocations[0].utilization_pct = allocations[0].budget
        ? Math.round((allocations[0].spent / allocations[0].budget) * 100)
        : 0
    }
    const expenses = project.expenses.map((expense) => {
      const allocation =
        allocations.find((item) => item.name === expense.task_name) ??
        allocations[0]
      return {
        ...expense,
        allocation_id: allocation?.id,
        project_id: project.id,
      }
    })
    const seededProject: ProjectDetailResponse = {
      ...project,
      allocations,
      expenses,
      upcoming_payments:
        index === 0
          ? [
              createSeedPayment(
                project.id,
                1,
                "Final steel delivery",
                8_500_000
              ),
              createSeedPayment(project.id, 2, "Equipment hire", 3_200_000),
            ]
          : [],
    }
    recalculateProject(seededProject)
    return seededProject
  })

  return {
    projects,
    suppliers: clone(mockSuppliers),
    uploads: new Map(),
  }
}

function createSeedPayment(
  projectId: number,
  id: number,
  title: string,
  amount: number
): UpcomingPaymentResponse {
  const timestamp = "2026-07-15T08:00:00.000Z"
  return {
    amount,
    created_at: timestamp,
    currency: "UGX",
    description: null,
    due_date: `2026-07-${20 + id}`,
    id: projectId * 100 + id,
    project_id: projectId,
    status: "pending",
    supplier_name: id === 1 ? "Mirembe Steel" : "LiftPro Rentals",
    title,
    updated_at: timestamp,
  }
}

function getWorkspace(organizationId: string): MockWorkspace {
  const current = workspaces.get(organizationId)
  if (current) return current

  const seeded = seedWorkspace()
  workspaces.set(organizationId, seeded)
  return seeded
}

function requireProject(workspace: MockWorkspace, projectId: number) {
  const project = workspace.projects.find((item) => item.id === projectId)
  if (!project) {
    throw new MockRepositoryError(`Mock project ${projectId} was not found.`)
  }
  return project
}

function recalculateProject(project: ProjectDetailResponse) {
  const allocations = project.allocations ?? []
  const spent = allocations.reduce(
    (sum, allocation) => sum + allocation.spent,
    0
  )
  const budget = allocations.length
    ? allocations.reduce((sum, allocation) => sum + allocation.budget, 0)
    : project.budget

  for (const allocation of allocations) {
    allocation.remaining = Math.max(allocation.budget - allocation.spent, 0)
    allocation.utilization_pct = allocation.budget
      ? Math.round((allocation.spent / allocation.budget) * 100)
      : 0
  }

  project.tasks = allocations.map((allocation) => ({
    budget: allocation.budget,
    id: allocation.id,
    name: allocation.name,
    pct: allocation.utilization_pct,
    spent: allocation.spent,
  }))
  project.budget = budget
  project.spent = spent
  project.remaining = Math.max(budget - spent, 0)
  project.pct = budget ? Math.round((spent / budget) * 100) : 0
}

function nextId(values: Array<{ id: number }>): number {
  return Math.max(0, ...values.map((value) => value.id)) + 1
}

export function getMockDashboardData(
  organizationId: string
): DashboardOverviewData {
  const workspace = getWorkspace(organizationId)
  const projects = workspace.projects.map(
    ({
      expenses: _expenses,
      tasks: _tasks,
      allocations: _allocations,
      suppliers: _suppliers,
      upcoming_payments: _payments,
      ...project
    }) => project
  )
  const expenses = workspace.projects.flatMap((project) =>
    project.expenses.map((expense) => ({
      ...expense,
      project_name: project.name,
      status: expense.status ?? "Not paid",
    }))
  )

  return clone({
    expenses,
    projects,
    source: "mock" as const,
    spendChart: mockSpendChart,
    suppliers: workspace.suppliers,
    utilizationChart: mockUtilizationChart,
  })
}

export function getMockProjectDetail(
  organizationId: string,
  projectId: number
): ProjectDetailResponse | undefined {
  const project = getWorkspace(organizationId).projects.find(
    (item) => item.id === projectId
  )
  return project ? clone(project) : undefined
}

export function createMockProject(
  organizationId: string,
  input: ProjectCreate
): ProjectDetailResponse {
  const workspace = getWorkspace(organizationId)
  const projectId = nextId(workspace.projects)
  let allocationId = projectId * 100
  const allocations = input.allocations.map((allocation) => ({
    budget: allocation.budget,
    id: ++allocationId,
    name: allocation.name,
    remaining: allocation.budget,
    spent: 0,
    utilization_pct: 0,
  }))
  const budget = allocations.reduce(
    (sum, allocation) => sum + allocation.budget,
    0
  )
  const project: ProjectDetailResponse = {
    allocations,
    attachments: (input.attachment_ids ?? [])
      .map((id) => workspace.uploads.get(id))
      .filter((upload): upload is MockUpload => Boolean(upload))
      .map((upload) => ({
        content_type: upload.content_type,
        filename: upload.filename,
        id: upload.id,
        size_bytes: upload.size_bytes,
        url: `mock://file/${upload.id}`,
      })),
    budget,
    building_type: input.building_type,
    client_name: input.client_name,
    currency: "UGX",
    expenses: [],
    id: projectId,
    land_size: input.land_size,
    location: input.location,
    name: input.name,
    pct: 0,
    plot_size: input.land_size,
    remaining: budget,
    spent: 0,
    start_date: input.start_date,
    status: "on_track",
    suppliers: [],
    target_end_date: input.target_end_date,
    tasks: allocations.map((allocation) => ({
      budget: allocation.budget,
      id: allocation.id,
      name: allocation.name,
      pct: 0,
      spent: 0,
    })),
    upcoming_payments: [],
  }
  workspace.projects.unshift(project)
  return clone(project)
}

export function updateMockProject(
  organizationId: string,
  projectId: number,
  input: ProjectUpdate
) {
  const project = requireProject(getWorkspace(organizationId), projectId)
  Object.assign(project, input)
  if (input.land_size !== undefined) project.plot_size = input.land_size
  return clone(project)
}

export function createMockProjectTask(
  organizationId: string,
  projectId: number,
  input: { budget: number; name: string }
) {
  const project = requireProject(getWorkspace(organizationId), projectId)
  const allocations = project.allocations ?? []
  if (allocations.some((allocation) => allocation.name === input.name)) {
    throw new MockRepositoryError("A task with that name already exists.")
  }
  const allocation = {
    budget: input.budget,
    id: nextId(allocations),
    name: input.name,
    remaining: input.budget,
    spent: 0,
    utilization_pct: 0,
  }
  project.allocations = [...allocations, allocation]
  recalculateProject(project)
  return clone(allocation)
}

export function updateMockAllocation(
  organizationId: string,
  projectId: number,
  allocationId: number,
  input: AllocationUpdate
) {
  const project = requireProject(getWorkspace(organizationId), projectId)
  const allocation = project.allocations?.find(
    (item) => item.id === allocationId
  )
  if (!allocation) {
    throw new MockRepositoryError(
      `Mock allocation ${allocationId} was not found.`
    )
  }
  Object.assign(allocation, input)
  recalculateProject(project)
  return clone(allocation)
}

export function createMockExpenseReceipt(
  organizationId: string,
  projectId: number,
  receipt: ExpenseReceiptCreate
) {
  const workspace = getWorkspace(organizationId)
  const project = requireProject(workspace, projectId)
  const allExpenses = workspace.projects.flatMap((item) => item.expenses)
  let expenseId = nextId(allExpenses)
  const receiptId = expenseId
  const expenses: ExpenseResponse[] = receipt.items.map((item) => {
    const allocation = project.allocations?.find(
      (candidate) => candidate.id === item.allocation_id
    )
    if (!allocation) {
      throw new MockRepositoryError(
        `Mock allocation ${item.allocation_id} was not found.`
      )
    }
    return {
      allocation_id: allocation.id,
      amount: item.quantity * item.unit_rate,
      date: receipt.expense_date,
      id: expenseId++,
      receipt_id: receiptId,
      item_description: item.item_description,
      project_id: projectId,
      quantity: item.quantity,
      status: toUiExpenseStatus(receipt.payment_status),
      supplier_name: item.supplier_name,
      task_name: allocation.name,
      unit_rate: item.unit_rate,
    }
  })
  project.expenses.unshift(...expenses)
  for (const expense of expenses) {
    const allocation = project.allocations?.find(
      (item) => item.id === expense.allocation_id
    )
    if (allocation) allocation.spent += expense.amount
  }
  for (const expense of expenses) {
    const supplier = workspace.suppliers.find(
      (item) => item.name === expense.supplier_name
    )
    if (supplier) {
      supplier.amount += expense.amount
      supplier.payments += 1
    } else {
      workspace.suppliers.push({
        amount: expense.amount,
        category: "other",
        id: nextId(
          workspace.suppliers.filter(
            (item): item is SupplierResponse & { id: number } =>
              typeof item.id === "number"
          )
        ),
        name: expense.supplier_name,
        payments: 1,
      })
    }
  }
  project.suppliers = summarizeProjectSuppliers(project)
  recalculateProject(project)
  return clone(expenses)
}

export function updateMockExpenseStatus(
  organizationId: string,
  projectId: number,
  expenseId: number,
  status: ExpenseStatus
) {
  const project = requireProject(getWorkspace(organizationId), projectId)
  const expense = project.expenses.find((item) => item.id === expenseId)
  if (!expense) {
    throw new MockRepositoryError(`Mock expense ${expenseId} was not found.`)
  }
  expense.status = status
  return clone(expense)
}

export function createMockUpcomingPayment(
  organizationId: string,
  projectId: number,
  input: UpcomingPaymentCreate
) {
  const workspace = getWorkspace(organizationId)
  const project = requireProject(workspace, projectId)
  const payments = workspace.projects.flatMap(
    (item) => item.upcoming_payments ?? []
  )
  const timestamp = new Date().toISOString()
  const payment: UpcomingPaymentResponse = {
    ...input,
    created_at: timestamp,
    id: nextId(payments),
    project_id: projectId,
    status: "pending",
    updated_at: timestamp,
  }
  project.upcoming_payments = [payment, ...(project.upcoming_payments ?? [])]
  return clone(payment)
}

export function updateMockUpcomingPayment(
  organizationId: string,
  projectId: number,
  paymentId: number,
  input: UpcomingPaymentUpdate
) {
  const project = requireProject(getWorkspace(organizationId), projectId)
  const payment = project.upcoming_payments?.find(
    (item) => item.id === paymentId
  )
  if (!payment) {
    throw new MockRepositoryError(`Mock payment ${paymentId} was not found.`)
  }
  Object.assign(payment, input, { updated_at: new Date().toISOString() })
  return clone(payment)
}

export function deleteMockUpcomingPayment(
  organizationId: string,
  projectId: number,
  paymentId: number
) {
  const project = requireProject(getWorkspace(organizationId), projectId)
  const payments = project.upcoming_payments ?? []
  if (!payments.some((item) => item.id === paymentId)) {
    throw new MockRepositoryError(`Mock payment ${paymentId} was not found.`)
  }
  project.upcoming_payments = payments.filter((item) => item.id !== paymentId)
}

export function createMockSupplier(
  organizationId: string,
  input: {
    name: string
    category: SupplierResponse["category"]
    companyContact?: string
    contactName?: string
    phone?: string
    email?: string
    notes?: string
  }
) {
  const workspace = getWorkspace(organizationId)
  const supplier: SupplierResponse = {
    companyContact: input.companyContact,
    contactName: input.contactName,
    amount: 0,
    category: input.category,
    email: input.email,
    id: nextId(
      workspace.suppliers.filter(
        (item): item is SupplierResponse & { id: number } =>
          typeof item.id === "number"
      )
    ),
    name: input.name,
    notes: input.notes,
    payments: 0,
    phone: input.phone,
    status: "active",
  }
  workspace.suppliers = [
    supplier,
    ...workspace.suppliers.filter(
      (item) => item.name.toLowerCase() !== input.name.toLowerCase()
    ),
  ]
  return clone(supplier)
}

export function requestMockFileUpload(
  organizationId: string,
  input: FileUploadRequest
): FileUploadResponse {
  const workspace = getWorkspace(organizationId)
  const id = `mock-file-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  workspace.uploads.set(id, { ...input, id })
  return {
    expires_at: new Date(Date.now() + 15 * 60_000).toISOString(),
    file_id: id,
    headers: {},
    upload_url: `mock://upload/${id}`,
  }
}

export function completeMockFileUpload(organizationId: string, fileId: string) {
  const upload = getWorkspace(organizationId).uploads.get(fileId)
  if (!upload) {
    throw new MockRepositoryError(`Mock file ${fileId} was not found.`)
  }
  return { id: upload.id }
}

function summarizeProjectSuppliers(project: ProjectDetailResponse) {
  const totals = new Map<string, number>()
  for (const expense of project.expenses) {
    totals.set(
      expense.supplier_name,
      (totals.get(expense.supplier_name) ?? 0) + expense.amount
    )
  }
  return [...totals].map(([name, amount]) => ({ amount, name }))
}

export function resetMockWorkspace(organizationId?: string) {
  if (organizationId) workspaces.delete(organizationId)
  else workspaces.clear()
}
