import type {
  ApiExpenseResponse,
  ApiSupplierResponse,
  ExpenseResponse,
  ExpenseStatus,
  ExpenseTableRow,
  PaymentStatus,
  ProjectDashboardResponse,
  ProjectDetailApiResponse,
  ProjectDetailResponse,
  ProjectSummaryResponse,
  SupplierResponse,
} from "@/lib/types"

const apiToUiStatus: Record<string, ExpenseStatus> = {
  paid: "Full",
  partially_paid: "Partial",
  unpaid: "Not paid",
}

const uiToApiStatus: Record<ExpenseStatus, PaymentStatus> = {
  Full: "paid",
  Partial: "partially_paid",
  "Not paid": "unpaid",
}

export function toUiExpenseStatus(status: string): ExpenseStatus {
  return apiToUiStatus[status] ?? "Not paid"
}

export function toApiExpenseStatus(status: ExpenseStatus): PaymentStatus {
  return uiToApiStatus[status]
}

export function toProjectSummary(
  project: ProjectSummaryResponse
): ProjectDashboardResponse {
  return {
    budget: project.budget,
    building_type: project.building_type,
    client_name: project.client_name,
    currency: project.currency,
    id: project.id,
    land_size: project.land_size,
    location: project.location,
    name: project.name,
    pct: project.utilization_pct,
    plot_size: project.plot_size ?? project.land_size,
    remaining: project.remaining,
    spent: project.spent,
    start_date: project.start_date,
    status: project.status,
    target_end_date: project.target_end_date,
  }
}

export function toExpense(expense: ApiExpenseResponse): ExpenseResponse {
  return {
    allocation_id: expense.allocation_id,
    amount: expense.amount,
    date: expense.expense_date || expense.date || "",
    id: expense.id,
    receipt_id: expense.receipt_id ?? expense.id,
    item_description: expense.item_description,
    project_id: expense.project_id,
    quantity: expense.quantity,
    receipt_url: expense.receipt_file?.url ?? null,
    source: expense.source,
    paid_amount: expense.paid_amount,
    outstanding_amount: expense.outstanding_amount,
    status: toUiExpenseStatus(expense.payment_status),
    supplier_name:
      expense.supplier?.name ?? expense.supplier_name ?? "Unknown supplier",
    task_name: expense.allocation_name || expense.task_name || "Unallocated",
    unit_rate: expense.unit_rate,
  }
}

export function toExpenseTableRow(
  expense: ApiExpenseResponse
): ExpenseTableRow {
  return {
    ...toExpense(expense),
    project_name: expense.project_name,
    status: toUiExpenseStatus(expense.payment_status),
  }
}

export function toSupplier(supplier: ApiSupplierResponse): SupplierResponse {
  return {
    amount: supplier.paid_amount ?? supplier.total_paid,
    category: normalizeSupplierCategory(supplier.category),
    id: supplier.id,
    name: supplier.name,
    outstanding_amount: supplier.outstanding_amount,
    payments: supplier.payments_count,
    phone: supplier.phone,
    status: supplier.status,
    supplier_id: supplier.id,
  }
}

function normalizeSupplierCategory(
  category: string
): SupplierResponse["category"] {
  if (
    category === "materials" ||
    category === "labour" ||
    category === "equipment" ||
    category === "services"
  ) {
    return category
  }
  return "other"
}

export function toProjectDetail(
  project: ProjectDetailApiResponse
): ProjectDetailResponse {
  const allocations = project.allocations ?? []
  const tasks = allocations.length
    ? allocations.map((allocation) => ({
        budget: allocation.budget,
        id: allocation.id,
        name: allocation.name,
        pct: allocation.utilization_pct,
        spent: allocation.spent,
      }))
    : project.tasks

  return {
    ...toProjectSummary(project),
    attachments: project.attachments,
    allocations,
    expenses: project.expenses.items.map(toExpense),
    suppliers: project.suppliers,
    tasks,
    upcoming_payments: project.upcoming_payments,
  }
}
