import type { components } from "@/types/api"

type ApiSchemas = components["schemas"]

export type PaymentStatus = "paid" | "partially_paid" | "unpaid"
export type ExpenseStatus = "Partial" | "Full" | "Not paid"

export type ProjectStatus =
  | "draft"
  | "on_track"
  | "at_risk"
  | "over_budget"
  | "completed"
  | "archived"

export type BuildingType =
  | "residential"
  | "commercial"
  | "mixed_use"
  | "industrial"
  | "other"

// API contract types are generated from the backend OpenAPI document.
export type ProjectAllocationCreate = ApiSchemas["ProjectAllocationCreate"]
export type ProjectCreate = ApiSchemas["ProjectCreate"]
export type ProjectUpdate = ApiSchemas["ProjectUpdate"]
export type AllocationUpdate = ApiSchemas["AllocationUpdate"]
export type ProjectSummaryResponse = ApiSchemas["ProjectSummaryResponse"]
export type ProjectAllocationResponse = ApiSchemas["ProjectAllocationResponse"]
export type TaskResponse = ApiSchemas["TaskResponse"]
export type SupplierSubResponse = ApiSchemas["SupplierSubResponse"]
export type ReceiptFileResponse = ApiSchemas["ReceiptFileSubResponse"]
export type ApiExpenseResponse = ApiSchemas["ExpenseResponse"]
export type ExpenseCreate = ApiSchemas["ExpenseCreate"]
export type ExpenseReceiptItemCreate = ApiSchemas["ExpenseReceiptItemCreate"]
export type ExpenseReceiptCreate = ApiSchemas["ExpenseReceiptCreate"]
export type ExpenseUpdate = ApiSchemas["ExpenseUpdate"]
export type SupplierBreakdown = ApiSchemas["SupplierBreakdown"]
export type ApiSupplierResponse = ApiSchemas["SupplierResponse"]
export type UpcomingPaymentCreate = ApiSchemas["UpcomingPaymentCreate"]
export type UpcomingPaymentUpdate = ApiSchemas["UpcomingPaymentUpdate"]
export type UpcomingPaymentResponse = ApiSchemas["UpcomingPaymentResponse"]
export type ProjectDetailApiResponse = ApiSchemas["ProjectDetailResponse"]
export type FileUploadRequest = ApiSchemas["FileUploadRequest"]
export type FileUploadResponse = ApiSchemas["FileUploadResponse"]
export type FileCompleteResponse = ApiSchemas["FileCompleteResponse"]
export type DashboardOverviewResponse = ApiSchemas["DashboardOverviewResponse"]
export type PaginatedProjectsResponse = ApiSchemas["PaginatedProjectsResponse"]
export type PaginatedExpensesResponse = ApiSchemas["PaginatedExpensesResponse"]
export type ValidationError = ApiSchemas["ValidationError"]
export type HTTPValidationError = ApiSchemas["HTTPValidationError"] & {
  message?: string
}

export type FileUploadPurpose = "project_attachment" | "expense_receipt"

// View models preserve the existing component API while normalizers isolate
// backend compatibility aliases such as pct/tasks/date.
export type ProjectDashboardResponse = {
  id: number
  name: string
  location: string
  plot_size?: string | null
  land_size?: string | null
  building_type?: string | null
  client_name?: string | null
  status?: string
  start_date?: string | null
  target_end_date?: string | null
  currency?: string
  budget: number
  spent: number
  remaining: number
  pct: number
}

export type ExpenseResponse = {
  id: number
  project_id?: number
  allocation_id?: number
  date: string
  task_name: string
  supplier_name: string
  item_description: string
  amount: number
  status?: ExpenseStatus
  quantity?: number
  unit_rate?: number
  receipt_url?: string | null
}

export type SupplierResponse = SupplierBreakdown & {
  id?: number
  payments: number
  category: "materials" | "labour" | "equipment" | "services" | "other"
  outstanding_amount?: number
  status?: string
}

export type ProjectDetailResponse = ProjectDashboardResponse & {
  tasks: TaskResponse[]
  allocations?: ProjectAllocationResponse[]
  expenses: ExpenseResponse[]
  suppliers: SupplierBreakdown[]
  upcoming_payments?: UpcomingPaymentResponse[]
}

export type TeamMember = {
  name: string
  role: "Owner / Admin" | "Site manager" | "Accountant"
  responsibility: string
}

export type CompanySettings = {
  company: string
  currency: "UGX"
  defaultRegion: string
  fiscalPeriod: "Monthly" | "Quarterly" | "Annual"
}

export type DashboardSource = "api" | "mock"

export type ExpenseTableRow = ExpenseResponse & {
  project_name: string
  status: ExpenseStatus
}

export type DashboardStat = {
  label: string
  value: string
  detail: string
}

export type SpendChartPoint = {
  month: string
  spent: number
  budget: number
}

export type UtilizationChartPoint = {
  month: string
  utilization: number
}

export type DashboardOverviewData = {
  source: DashboardSource
  projects: ProjectDashboardResponse[]
  expenses: ExpenseTableRow[]
  suppliers: SupplierResponse[]
  stats: DashboardStat[]
  spendChart: SpendChartPoint[]
  utilizationChart: UtilizationChartPoint[]
}
