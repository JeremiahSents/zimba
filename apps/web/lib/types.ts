export type ProjectDashboardResponse = {
  id: number
  name: string
  location: string
  plot_size?: string | null
  budget: number
  spent: number
  remaining: number
  pct: number
}

export type TaskResponse = {
  id: number
  name: string
  budget: number
  spent: number
  pct: number
}

export type ExpenseResponse = {
  id: number
  date: string
  task_name: string
  supplier_name: string
  item_description: string
  amount: number
  status?: "Partial" | "Full" | "Not paid"
}

export type SupplierBreakdown = {
  name: string
  amount: number
}

export type ProjectDetailResponse = ProjectDashboardResponse & {
  tasks: TaskResponse[]
  expenses: ExpenseResponse[]
  suppliers: SupplierBreakdown[]
}

export type ProjectCreate = {
  name: string
  location: string
  plot_size?: string | null
  tasks: Record<string, unknown>[]
}

export type ExpenseCreate = {
  project_id: number
  task_id: number
  amount: number
  date: string
  supplier_name: string
  item_description: string
  receipt_url?: string | null
}

export type ValidationError = {
  loc: Array<string | number>
  msg: string
  type: string
  input?: unknown
  ctx?: Record<string, unknown>
}

export type HTTPValidationError = {
  detail?: ValidationError[]
}

export type SupplierResponse = SupplierBreakdown & {
  payments: number
  category: "materials" | "labour" | "equipment" | "services"
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
  status: "Partial" | "Full" | "Not paid"
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
