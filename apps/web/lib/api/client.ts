import "server-only"

import type { ZimbaApiSession } from "@/lib/api/auth"
import type {
  ExpenseCreate,
  ExpenseResponse,
  HTTPValidationError,
  ProjectCreate,
  ProjectDashboardResponse,
  ProjectDetailResponse,
  SupplierResponse,
} from "@/lib/types"

const API_BASE_URL =
  process.env.ZIMBA_API_BASE_URL ??
  "https://zimba-backend-779644650318.us-central1.run.app"

type RequestOptions = {
  method?: "GET" | "POST"
  body?: unknown
  query?: Record<string, number | string | null | undefined>
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

async function zimbaFetch<T>(
  path: string,
  session: ZimbaApiSession,
  options: RequestOptions = {}
): Promise<T> {
  const url = new URL(path, API_BASE_URL)

  for (const [key, value] of Object.entries(options.query ?? {})) {
    if (value !== null && value !== undefined && value !== "") {
      url.searchParams.set(key, String(value))
    }
  }

  const response = await fetch(url, {
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${session.token}`,
      "Content-Type": "application/json",
      "x-organization-id": session.organizationId,
      "X-Organization-Id": session.organizationId,
    },
    method: options.method ?? "GET",
  })

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => undefined)) as
      | HTTPValidationError
      | undefined
    throw new ZimbaApiError(
      `Zimba API request failed with ${response.status}`,
      response.status,
      errorBody
    )
  }

  return (await response.json()) as T
}

export function listProjects(session: ZimbaApiSession) {
  return zimbaFetch<ProjectDashboardResponse[]>("/api/v1/projects", session)
}

export function createProject(
  session: ZimbaApiSession,
  project: ProjectCreate
) {
  return zimbaFetch<ProjectDashboardResponse>("/api/v1/projects", session, {
    body: project,
    method: "POST",
  })
}

export function getProjectDetail(session: ZimbaApiSession, projectId: number) {
  return zimbaFetch<ProjectDetailResponse>(
    `/api/v1/projects/${projectId}`,
    session
  )
}

export function listExpenses(
  session: ZimbaApiSession,
  query: { project_id?: number | null; search?: string | null } = {}
) {
  return zimbaFetch<ExpenseResponse[]>("/api/v1/expenses", session, {
    query,
  })
}

export function logExpense(session: ZimbaApiSession, expense: ExpenseCreate) {
  return zimbaFetch<ExpenseResponse>("/api/v1/expenses", session, {
    body: expense,
    method: "POST",
  })
}

export function listSuppliers(session: ZimbaApiSession) {
  return zimbaFetch<SupplierResponse[]>("/api/v1/suppliers", session)
}
