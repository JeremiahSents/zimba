import type { ExpenseTableRow, SupplierResponse } from "@/lib/types"

export type SupplierPaymentStatus = "Full" | "Partial" | "Not paid"
export type SupplierReceiptStatus =
  | "New"
  | "Pending"
  | "Partial"
  | "Paid in full"
export type SupplierListItem = SupplierResponse & {
  paid: number
  remaining: number
  statusSummary: Record<SupplierPaymentStatus, number>
}
export type SupplierLedgerEntry = {
  id: string
  date: string
  project: string
  item: string
  receiptValue: number
  paid: number
  remaining: number
  status: SupplierPaymentStatus
}
export type SupplierReceiptRow = {
  id: string
  supplierId?: string
  supplierName: string
  item: string
  project: string
  value: number
  paid: number
  remaining: number
  date: string
  createdAt: string
  status: SupplierReceiptStatus
}
export type SupplierProfile = {
  companyContact: string
  contactName: string
  phone: string
  email: string
}

export function getSupplierSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export function getSupplierBySlug(slug: string, suppliers: SupplierResponse[]) {
  return suppliers.find((supplier) => supplier.id === slug || supplier.supplier_id === slug || getSupplierSlug(supplier.name) === slug)
}

export function getSupplierListItems(
  suppliers: SupplierResponse[],
  expenses: ExpenseTableRow[]
): SupplierListItem[] {
  return suppliers.map((supplier) => {
    const supplierId = supplier.id ?? supplier.supplier_id
    const related = expenses.filter((expense) =>
      supplierId
        ? expense.supplier_id === supplierId
        : expense.supplier_name === supplier.name
    )
    const receiptValue =
      supplier.total_incurred ??
      supplier.amount ??
      related.reduce((sum, expense) => sum + expense.amount, 0)
    const paid =
      supplier.total_paid ??
      related.reduce(
        (sum, expense) =>
          sum +
          (expense.paid_amount ??
            (expense.status === "Full" ? expense.amount : 0)),
        0
      )
    const statusSummary = related.reduce<Record<SupplierPaymentStatus, number>>(
      (summary, expense) => {
        summary[expense.status] += 1
        return summary
      },
      { Full: 0, Partial: 0, "Not paid": 0 }
    )
    return {
      ...supplier,
      amount: receiptValue,
      paid,
      remaining: Math.max(0, receiptValue - paid),
      statusSummary,
    }
  })
}

export function getSupplierLedger(
  supplier: SupplierResponse,
  expenses: ExpenseTableRow[]
): SupplierLedgerEntry[] {
  const supplierId = supplier.id ?? supplier.supplier_id
  return expenses
    .filter((expense) =>
      supplierId
        ? expense.supplier_id === supplierId
        : expense.supplier_name === supplier.name
    )
    .map((expense) => {
      const paid =
        expense.paid_amount ?? (expense.status === "Full" ? expense.amount : 0)
      return {
        id: `expense-${expense.id}`,
        date: expense.date,
        project: expense.project_name,
        item: expense.item_description,
        receiptValue: expense.amount,
        paid,
        remaining: Math.max(0, expense.amount - paid),
        status: expense.status,
      }
    })
}

export function getSupplierProfile(
  _name: string,
  supplier?: SupplierResponse
): SupplierProfile {
  return {
    companyContact:
      supplier?.companyContact ?? supplier?.phone ?? "Not provided",
    contactName: supplier?.contactName ?? "Not provided",
    email: supplier?.email ?? "Not provided",
    phone: supplier?.phone ?? "Not provided",
  }
}

export function getSupplierReceiptRows(
  suppliers: SupplierResponse[],
  expenses: ExpenseTableRow[]
): SupplierReceiptRow[] {
  const supplierNames = new Map(
    suppliers.map((supplier) => [
      supplier.id ?? supplier.supplier_id,
      supplier.name,
    ])
  )
  const now = Date.now()
  return expenses.map((expense) => {
    const paid =
      expense.paid_amount ?? (expense.status === "Full" ? expense.amount : 0)
    const remaining = Math.max(0, expense.amount - paid)
    const createdAt = expense.created_at ?? expense.date
    const status: SupplierReceiptStatus =
      remaining === 0
        ? "Paid in full"
        : paid > 0
          ? "Partial"
          : now - new Date(createdAt).getTime() <= 7 * 24 * 60 * 60 * 1000
            ? "New"
            : "Pending"
    return {
      id: expense.receipt_id ?? expense.id,
      supplierId: expense.supplier_id,
      supplierName:
        supplierNames.get(expense.supplier_id) ?? expense.supplier_name,
      item: expense.item_description,
      project: expense.project_name,
      value: expense.amount,
      paid,
      remaining,
      date: expense.date,
      createdAt,
      status,
    }
  })
}
