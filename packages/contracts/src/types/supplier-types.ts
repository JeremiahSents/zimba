export type SupplierDto = {
  id: string
  organizationId: string
  name: string
  category: string | null
  email: string | null
  status: string
}
export type SupplierPaymentStatus = "Full" | "Partial" | "Not paid"
export type SupplierReceiptStatus =
  | "New"
  | "Pending"
  | "Partial"
  | "Paid in full"
export type SupplierListItem = {
  id?: string
  supplier_id?: string
  name: string
  amount: number
  payments: number
  category: string
  companyContact?: string
  contactName?: string
  phone?: string | null
  email?: string | null
  notes?: string | null
  status?: string
  total_incurred?: number
  total_paid?: number
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
