// Client-safe view models. Backend inputs are validated in core module schemas.
export type ExpenseStatus = "Partial" | "Full" | "Not paid"
export type PaymentStatus = "paid" | "partially_paid" | "unpaid"

export type ProjectAllocationCreate = { name: string; budget: number }
export type ProjectCreate = {
  name: string
  location: string
  land_size: string
  building_type: string
  client_name?: string | null
  start_date?: string | null
  target_end_date?: string | null
  attachment_ids?: string[] | null
  allocations: ProjectAllocationCreate[]
}
export type ProjectUpdate = Partial<Omit<ProjectCreate, "allocations">> & {
  status?: string
}
export type AllocationUpdate = { name?: string | null; budget?: number | null }
export type SupplierCreate = {
  name: string
  category: string | null
  phone?: string | null
  email?: string | null
  notes?: string | null
  companyContact?: string | null
  contactName?: string | null
}
export type NewSupplierValues = {
  name: string
  category: SupplierResponse["category"]
  companyContact: string
  contactName: string
  phone: string
  email: string
  notes: string
}

export type ExpenseReceiptItemCreate = {
  allocation_id: string | number
  supplier_name: string
  item_description: string
  quantity: number
  unit_rate: number
  payment_status?: string
  amount_paid?: number
}
export type ExpenseReceiptCreate = {
  expense_date: string
  payment_status?: PaymentStatus
  receipt_file_id?: string | null
  amount_paid?: number
  items: ExpenseReceiptItemCreate[]
}
export type PayableExpenseLineCreate = {
  allocation_id: string | number
  description: string
  quantity: number
  unit_amount: number
  tax_amount?: number
}
export type PayableExpenseCreate = {
  project_id: string | number
  supplier_id: string | number
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
  id: string
  project_id: string
  supplier_id: string
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
    id: string
    allocation_id: string
    allocation_name: string
    description: string
    quantity: number
    unit_amount: number
    tax_amount: number
    line_amount: number
  }>
  payments: Array<{
    id: string
    amount: number
    payment_date: string
    method: string
    reference?: string | null
    status: string
  }>
}

export type UpcomingPaymentCreate = {
  title: string
  description?: string | null
  supplier_name?: string | null
  amount: number
  currency: string
  due_date: string
}
export type UpcomingPaymentUpdate = Partial<UpcomingPaymentCreate> & {
  status?: string | null
}
export type UpcomingPaymentResponse = UpcomingPaymentCreate & {
  id: string
  project_id: string
  status: string
  created_at: string
  updated_at: string
}
export type FileUploadPurpose = "project_attachment" | "expense_receipt"
export type ProjectAttachment = {
  id: string
  key?: string
  filename: string
  content_type: string
  size_bytes: number
  url: string
  purpose?: string
  created_at?: string
}

export type ProjectDashboardResponse = {
  id: string
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
export type TaskResponse = {
  id: string
  name: string
  budget: number
  spent: number
  pct: number
}
export type ProjectAllocationResponse = {
  id: string
  name: string
  budget: number
  spent: number
  remaining: number
  utilization_pct: number
}
export type SupplierBreakdown = {
  supplier_id?: string
  name: string
  amount: number
}
export type ExpenseResponse = {
  id: string
  receipt_id?: string | null
  project_id?: string
  supplier_id?: string
  allocation_id?: string
  date: string
  task_name: string
  supplier_name: string
  item_description: string
  amount: number
  status?: ExpenseStatus
  quantity?: number
  unit_rate?: number
  receipt_url?: string | null
  paid_amount?: number | null
  outstanding_amount?: number | null
}
export type SupplierResponse = SupplierBreakdown & {
  id?: string
  payments: number
  category: string
  companyContact?: string
  contactName?: string
  phone?: string | null
  email?: string | null
  notes?: string | null
  outstanding_amount?: number
  total_incurred?: number
  total_paid?: number
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
  email?: string
  role: string
  responsibility: string
}
export type CompanySettings = {
  company: string
  currency: "UGX"
  defaultRegion: string
  fiscalPeriod: "Monthly" | "Quarterly" | "Annual"
}
export type ExpenseTableRow = ExpenseResponse & {
  project_name: string
  status: ExpenseStatus
  paid_amount?: number
  outstanding_amount?: number
  created_at?: string
}
export type DashboardStat = { label: string; value: string; detail: string }
export type SpendChartPoint = { month: string; spent: number; budget: number }
export type UtilizationChartPoint = { month: string; utilization: number }
export type DashboardOverviewData = {
  projects: ProjectDashboardResponse[]
  expenses: ExpenseTableRow[]
  suppliers: SupplierResponse[]
  spendChart: SpendChartPoint[]
  utilizationChart: UtilizationChartPoint[]
}
