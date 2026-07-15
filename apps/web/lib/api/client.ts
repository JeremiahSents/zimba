import "server-only"

import type { ZimbaApiSession } from "@/lib/api/auth"
import type {
  AllocationUpdate,
  ApiExpenseResponse,
  ApiSupplierResponse,
  DashboardOverviewResponse,
  ExpenseCreate,
  ExpenseReceiptCreate,
  ExpenseUpdate,
  FileCompleteResponse,
  FileUploadRequest,
  FileUploadResponse,
  HTTPValidationError,
  PaginatedExpensesResponse,
  PaginatedProjectsResponse,
  ProjectAllocationResponse,
  ProjectCreate,
  ProjectDetailApiResponse,
  ProjectSummaryResponse,
  ProjectUpdate,
  SupplierCreate,
  UpcomingPaymentCreate,
  UpcomingPaymentResponse,
  UpcomingPaymentUpdate,
} from "@/lib/types"

const DEFAULT_API_BASE_URL =
  "https://zimba-backend-779644650318.us-central1.run.app"

type QueryValue = boolean | number | string | null | undefined

type RequestOptions = {
  method?: "DELETE" | "GET" | "PATCH" | "POST" | "PUT"
  body?: unknown
  query?: Record<string, QueryValue>
}

export class ZimbaApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly validation?: HTTPValidationError
  ) {
    super(message)
    this.name = "ZimbaApiError"
  }
}

function getApiBaseUrl() {
  const configured = process.env.ZIMBA_API_BASE_URL || DEFAULT_API_BASE_URL
  try {
    return new URL(configured.endsWith("/") ? configured : `${configured}/`)
  } catch {
    throw new Error("ZIMBA_API_BASE_URL must be a valid absolute URL.")
  }
}

async function zimbaFetch<T>(
  path: string,
  session: ZimbaApiSession,
  options: RequestOptions = {}
): Promise<T> {
  const url = new URL(path.replace(/^\//, ""), getApiBaseUrl())

  for (const [key, value] of Object.entries(options.query ?? {})) {
    if (value !== null && value !== undefined && value !== "") {
      url.searchParams.set(key, String(value))
    }
  }

  const hasBody = options.body !== undefined
  const response = await fetch(url, {
    body: hasBody ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${session.token}`,
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
      "X-Organization-Id": session.organizationId,
    },
    method: options.method ?? "GET",
  })

  if (response.status === 204) return undefined as T

  const text = await response.text()
  const payload = text ? parseJson(text) : undefined

  if (!response.ok) {
    const validation = isErrorPayload(payload) ? payload : undefined
    throw new ZimbaApiError(
      getErrorMessage(response.status, validation),
      response.status,
      validation
    )
  }

  return payload as T
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

function isErrorPayload(value: unknown): value is HTTPValidationError {
  return typeof value === "object" && value !== null
}

function getErrorMessage(status: number, body?: HTTPValidationError) {
  const validationMessage = body?.detail?.map((item) => item.msg).join(". ")
  if (validationMessage) return validationMessage
  if (body?.message) return body.message

  const statusMessages: Record<number, string> = {
    400: "The request could not be processed.",
    401: "The configured backend session is invalid or expired.",
    403: "This organization cannot access that resource.",
    404: "The requested resource was not found.",
    409: "The request conflicts with existing data.",
    422: "Some submitted values are invalid.",
    500: "The backend could not process this request. Its database may need the latest migrations.",
  }
  return statusMessages[status] ?? `The Zimba API returned status ${status}.`
}

export function listProjects(
  session: ZimbaApiSession,
  query: {
    search?: string | null
    status?: string | null
    page?: number
    page_size?: number
    sort_by?: string
    sort_order?: string
  } = {}
) {
  return zimbaFetch<PaginatedProjectsResponse>("/api/v1/projects", session, {
    query,
  })
}

export function createProject(
  session: ZimbaApiSession,
  project: ProjectCreate
) {
  return zimbaFetch<ProjectDetailApiResponse>("/api/v1/projects", session, {
    body: project,
    method: "POST",
  })
}

export function getProjectDetail(session: ZimbaApiSession, projectId: number) {
  return zimbaFetch<ProjectDetailApiResponse>(
    `/api/v1/projects/${projectId}`,
    session
  )
}

export function updateProject(
  session: ZimbaApiSession,
  projectId: number,
  project: ProjectUpdate
) {
  return zimbaFetch<ProjectSummaryResponse>(
    `/api/v1/projects/${projectId}`,
    session,
    { body: project, method: "PATCH" }
  )
}

export function updateAllocation(
  session: ZimbaApiSession,
  projectId: number,
  allocationId: number,
  allocation: AllocationUpdate
) {
  return zimbaFetch<ProjectAllocationResponse>(
    `/api/v1/projects/${projectId}/allocations/${allocationId}`,
    session,
    { body: allocation, method: "PATCH" }
  )
}

export function listExpenses(
  session: ZimbaApiSession,
  query: {
    project_id?: number | null
    allocation_id?: number | null
    supplier_id?: number | null
    payment_status?: string | null
    date_from?: string | null
    date_to?: string | null
    search?: string | null
    page?: number
    page_size?: number
    sort_by?: string
    sort_order?: string
  } = {}
) {
  return zimbaFetch<PaginatedExpensesResponse>("/api/v1/expenses", session, {
    query,
  })
}

export function logExpense(session: ZimbaApiSession, expense: ExpenseCreate) {
  return zimbaFetch<ApiExpenseResponse>("/api/v1/expenses", session, {
    body: expense,
    method: "POST",
  })
}

export function createExpenseReceipt(
  session: ZimbaApiSession,
  projectId: number,
  receipt: ExpenseReceiptCreate
) {
  return zimbaFetch<ApiExpenseResponse[]>(
    `/api/v1/projects/${projectId}/expense-receipts`,
    session,
    { body: receipt, method: "POST" }
  )
}

export function updateExpense(
  session: ZimbaApiSession,
  expenseId: number,
  expense: ExpenseUpdate
) {
  return zimbaFetch<ApiExpenseResponse>(
    `/api/v1/expenses/${expenseId}`,
    session,
    { body: expense, method: "PATCH" }
  )
}

export function listSuppliers(
  session: ZimbaApiSession,
  query: {
    search?: string | null
    category?: string | null
    date_from?: string | null
    date_to?: string | null
    page?: number
    page_size?: number
  } = {}
) {
  return zimbaFetch<ApiSupplierResponse[]>("/api/v1/suppliers", session, {
    query,
  })
}

export function createSupplier(
  session: ZimbaApiSession,
  supplier: SupplierCreate
) {
  return zimbaFetch<ApiSupplierResponse>("/api/v1/suppliers", session, {
    body: supplier,
    method: "POST",
  })
}

export function getDashboardOverview(
  session: ZimbaApiSession,
  query: {
    date_from?: string | null
    date_to?: string | null
    project_id?: number | null
  } = {}
) {
  return zimbaFetch<DashboardOverviewResponse>(
    "/api/v1/dashboard/overview",
    session,
    { query }
  )
}

export function listUpcomingPayments(
  session: ZimbaApiSession,
  projectId: number,
  status?: string | null
) {
  return zimbaFetch<UpcomingPaymentResponse[]>(
    `/api/v1/projects/${projectId}/upcoming-payments`,
    session,
    { query: { status } }
  )
}

export function createUpcomingPayment(
  session: ZimbaApiSession,
  projectId: number,
  payment: UpcomingPaymentCreate
) {
  return zimbaFetch<UpcomingPaymentResponse>(
    `/api/v1/projects/${projectId}/upcoming-payments`,
    session,
    { body: payment, method: "POST" }
  )
}

export function updateUpcomingPayment(
  session: ZimbaApiSession,
  projectId: number,
  paymentId: number,
  payment: UpcomingPaymentUpdate
) {
  return zimbaFetch<UpcomingPaymentResponse>(
    `/api/v1/projects/${projectId}/upcoming-payments/${paymentId}`,
    session,
    { body: payment, method: "PATCH" }
  )
}

export function deleteUpcomingPayment(
  session: ZimbaApiSession,
  projectId: number,
  paymentId: number
) {
  return zimbaFetch<void>(
    `/api/v1/projects/${projectId}/upcoming-payments/${paymentId}`,
    session,
    { method: "DELETE" }
  )
}

export function requestFileUpload(
  session: ZimbaApiSession,
  file: FileUploadRequest
) {
  return zimbaFetch<FileUploadResponse>("/api/v1/files/upload-url", session, {
    body: file,
    method: "POST",
  })
}

export function completeFileUpload(session: ZimbaApiSession, fileId: string) {
  return zimbaFetch<FileCompleteResponse>(
    `/api/v1/files/${encodeURIComponent(fileId)}/complete`,
    session,
    { method: "POST" }
  )
}
