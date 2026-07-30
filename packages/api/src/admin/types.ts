export type PlatformUserRole = "super_admin" | "support" | "none"
export type PlatformUserDto = {
  id: string
  userId: string
  role: PlatformUserRole
}
export type PlatformUserListDto = {
  id: string
  name: string
  email: string
  image: string | null
  createdAt: Date
  deactivatedAt: Date | null
  platformRole: PlatformUserRole | null
  membershipsCount: number
  primaryOrganization: string | null
}
export type PlatformUserDetailDto = PlatformUserListDto & {
  emailVerified: boolean
  deactivationReason: string | null
  memberships: Array<{
    organizationId: string
    organizationName: string
    role: string
  }>
}

/** Why an account cannot be permanently deleted yet. */
export type AccountRemovalBlockerCode =
  | "SELF"
  | "SOLE_OWNER"
  | "LAST_SUPER_ADMIN"
  | "PENDING_INVITATIONS"

export type AccountRemovalBlocker = {
  code: AccountRemovalBlockerCode
  message: string
  organizationId?: string
  organizationName?: string
}

export type AccountRemovalPreviewDto = {
  userId: string
  name: string
  email: string
  deactivatedAt: Date | null
  deactivationReason: string | null
  blockers: AccountRemovalBlocker[]
  canDelete: boolean
}

// ── Org-detail admin DTOs ──
// Read-only views a super admin sees while browsing a tenant. Every shape is
// org-scoped: the use cases refuse to cross tenant lines.

export type AdminProjectSummaryDto = {
  id: string
  name: string
  location: string
  buildingType: string | null
  status: string
  currency: string
  createdAt: Date
  archivedAt: Date | null
  budgetCents: number
  spentCents: number
  receiptCount: number
}

export type AdminBudgetItemDto = {
  id: string
  name: string
  budgetCents: number
  spentCents: number
}

export type AdminProjectReceiptDto = {
  id: string
  status: string
  expenseDate: Date | null
  createdAt: Date
  supplierName: string | null
  totalCents: number
  paidCents: number
  receiptFileUrl: string | null
  receiptFileName: string | null
  receiptContentType: string | null
}

export type AdminProjectPaymentDto = {
  id: string
  amountCents: number
  currency: string
  paymentDate: Date | null
  method: string | null
  reference: string | null
  createdAt: Date
  supplierName: string | null
  expenseId: string | null
  receiptFileUrl: string | null
  receiptFileName: string | null
  receiptContentType: string | null
}

export type AdminProjectDetailDto = {
  id: string
  name: string
  location: string
  buildingType: string | null
  clientName: string | null
  status: string
  currency: string
  startDate: Date | null
  targetEndDate: Date | null
  createdAt: Date
  budgetItems: AdminBudgetItemDto[]
  receipts: AdminProjectReceiptDto[]
  payments: AdminProjectPaymentDto[]
}

export type AdminSupplierWithStatsDto = {
  id: string
  name: string
  phone: string | null
  email: string | null
  category: string | null
  status: string
  createdAt: Date
  paymentCount: number
  totalPaidCents: number
}

export type AdminSupplierDetailDto = {
  id: string
  name: string
  phone: string | null
  email: string | null
  category: string | null
  status: string
  notes: string | null
  companyContact: string | null
  contactName: string | null
  createdAt: Date
}

export type AdminBudgetItemReceiptDto = {
  id: string
  status: string
  expenseDate: Date | null
  createdAt: Date
  supplierName: string | null
  totalCents: number
  paidCents: number
  itemCount: number
  receiptFileUrl: string | null
  receiptFileName: string | null
  receiptContentType: string | null
}

export type AdminSupplierPaymentDto = {
  id: string
  amountCents: number
  currency: string
  paymentDate: Date | null
  method: string | null
  reference: string | null
  createdAt: Date
  expenseId: string | null
  receiptFileUrl: string | null
  receiptFileName: string | null
  receiptContentType: string | null
}

export type AdminPaymentDetailDto = {
  id: string
  amountCents: number
  currency: string
  paymentDate: Date | null
  method: string | null
  reference: string | null
  createdAt: Date
  supplierId: string | null
  supplierName: string | null
  supplierPhone: string | null
  supplierEmail: string | null
  expenseId: string | null
  projectId: string | null
  projectName: string | null
  receiptFileUrl: string | null
  receiptFileName: string | null
  receiptContentType: string | null
}

export type AdminRecentExpenseDto = {
  id: string
  status: string
  expenseDate: Date | null
  createdAt: Date
  projectName: string | null
  supplierName: string | null
  totalCents: number
  itemCount: number
}

export type AdminOrgTrendDto = {
  spendCurrentCents: number
  spendPreviousCents: number
  paidCurrentCents: number
  paidPreviousCents: number
}

export type AdminOrgAnalyticsDto = {
  recentExpenses: AdminRecentExpenseDto[]
  trend: AdminOrgTrendDto
}
