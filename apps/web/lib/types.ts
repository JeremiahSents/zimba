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
export type ProjectUpdate = ApiSchemas["ProjectUpdate"] & {
  attachment_ids?: string[]
}
export type AllocationUpdate = ApiSchemas["AllocationUpdate"]
export type SupplierCreate = ApiSchemas["SupplierCreate"]
export type ProjectSummaryResponse = ApiSchemas["ProjectSummaryResponse"]
export type ProjectAllocationResponse = ApiSchemas["ProjectAllocationResponse"]
export type TaskResponse = ApiSchemas["TaskResponse"]
export type SupplierSubResponse = ApiSchemas["SupplierSubResponse"]
export type ReceiptFileResponse = ApiSchemas["ReceiptFileSubResponse"]
export type ApiExpenseResponse = ApiSchemas["ExpenseResponse"]
export type ExpenseCreate = ApiSchemas["ExpenseCreate"]
export type ExpenseReceiptItemCreate =
  ApiSchemas["ExpenseReceiptItemCreate"] & {
    payment_status?: string
    amount_paid?: number
  }
export type ExpenseReceiptCreate = ApiSchemas["ExpenseReceiptCreate"] & {
  amount_paid?: number
}

export type PayableExpenseLineCreate = {
  allocation_id: number
  description: string
  quantity: number
  unit_amount: number
  tax_amount?: number
}

export type PayableExpenseCreate = {
  project_id: number
  supplier_id: number
  currency: string
  vendor_reference?: string
  expense_date?: string
  due_date?: string
  lifecycle_status: "planned" | "incurred"
  submit_for_approval: boolean
  record_as_receipt?: boolean
  receipt_file_id?: string
  amount_paid?: number
  payment_date?: string
  payment_method?: string
  payment_reference?: string
  lines: PayableExpenseLineCreate[]
}

export type PayableExpenseResponse = {
  id: number
  project_id: number
  supplier_id: number
  currency: string
  vendor_reference?: string | null
  receipt_number?: string | null
  expense_date?: string | null
  due_date?: string | null
  approval_status: "draft" | "submitted" | "approved" | "rejected"
  lifecycle_status: "planned" | "incurred" | "cancelled" | "voided"
  gross_amount: number
  net_amount: number
  paid_amount: number
  outstanding_amount: number
  settlement_status:
    | "unpaid"
    | "partially_paid"
    | "paid"
    | "overpaid"
    | "refunded"
  project_name?: string | null
  supplier_name?: string | null
  receipt_file_url?: string | null
  lines: Array<{
    id: number
    allocation_id: number
    allocation_name: string
    description: string
    quantity: number
    unit_amount: number
    tax_amount: number
    line_amount: number
  }>
  payments: Array<{
    id: number
    amount: number
    payment_date: string
    method: string
    reference?: string | null
    status: string
  }>
}

export type LedgerPaymentCreate = {
  supplier_id: number
  amount: number
  currency: string
  payment_date: string
  method: string
  reference?: string
  idempotency_key: string
  allocations: Array<{ expense_id: number; amount: number }>
}

export type LedgerPaymentResponse = {
  id: number
  supplier_id: number
  amount: number
  currency: string
  payment_date: string
  method: string
  reference?: string | null
  status: string
  posted_at: string
  voucher_number: string
}
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

export type ProjectAttachment = {
  id: string
  filename: string
  content_type: string
  size_bytes: number
  url: string
  purpose?: string
  created_at?: string
}

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
  receipt_id?: number | null
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
  source?: string
  paid_amount?: number | null
  outstanding_amount?: number | null
}

export type SupplierResponse = SupplierBreakdown & {
  id?: number
  payments: number
  category: "materials" | "labour" | "equipment" | "services" | "other"
  companyContact?: string
  contactName?: string
  phone?: string | null
  email?: string
  notes?: string
  outstanding_amount?: number
  status?: string
}

export type ProjectDetailResponse = ProjectDashboardResponse & {
  attachments?: ProjectAttachment[]
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
  spendChart: SpendChartPoint[]
  utilizationChart: UtilizationChartPoint[]
}
