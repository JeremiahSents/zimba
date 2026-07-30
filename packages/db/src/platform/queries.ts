import { and, count, desc, eq, gt, isNull, or, sql } from "drizzle-orm"
import { user } from "../auth/schema"
import { member, organization } from "../organizations/schema"
import { budgetItem, project } from "../projects/schema"
import { expense, expenseLine, payable, payment } from "../receipts/schema"
import type { DatabaseExecutor } from "../shared/executor"
import { supplier } from "../suppliers/schema"
import {
  platformAuditLog,
  platformInvitation,
  platformUser,
  platformWorkspaceGrant,
} from "./schema"

export function findPlatformUserForUser(
  executor: DatabaseExecutor,
  userId: string
) {
  return executor
    .select()
    .from(platformUser)
    .where(eq(platformUser.userId, userId))
    .limit(1)
}

/**
 * Every super admin who can be emailed. Deactivated accounts are excluded:
 * they cannot sign in to act on what they would be told about.
 */
export function listSuperAdminRecipients(executor: DatabaseExecutor) {
  return executor
    .select({ id: user.id, name: user.name, email: user.email })
    .from(platformUser)
    .innerJoin(user, eq(user.id, platformUser.userId))
    .where(
      and(eq(platformUser.role, "super_admin"), isNull(user.deactivatedAt))
    )
    .orderBy(user.name)
}

export async function readPlatformStats(executor: DatabaseExecutor) {
  const [
    total,
    active,
    trial,
    suspended,
    users,
    projects,
    receipts,
    payments,
    failed,
  ] = await Promise.all([
    executor.select({ count: count() }).from(organization),
    executor
      .select({ count: count() })
      .from(organization)
      .where(eq(organization.status, "active")),
    executor
      .select({ count: count() })
      .from(organization)
      .where(eq(organization.status, "trial")),
    executor
      .select({ count: count() })
      .from(organization)
      .where(eq(organization.status, "suspended")),
    executor.select({ count: count() }).from(user),
    executor.select({ count: count() }).from(project),
    executor.select({ count: count() }).from(expense),
    executor.select({ count: count() }).from(payment),
    executor
      .select({ count: count() })
      .from(payment)
      .where(eq(payment.method, "failed")),
  ])
  return {
    totalOrganizations: total[0]?.count ?? 0,
    activeOrganizations: active[0]?.count ?? 0,
    trialOrganizations: trial[0]?.count ?? 0,
    suspendedOrganizations: suspended[0]?.count ?? 0,
    totalUsers: users[0]?.count ?? 0,
    totalProjects: projects[0]?.count ?? 0,
    totalReceipts: receipts[0]?.count ?? 0,
    totalPayments: payments[0]?.count ?? 0,
    failedPayments: failed[0]?.count ?? 0,
  }
}

export function listPlatformUserRows(executor: DatabaseExecutor) {
  return executor
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      image: user.image,
      createdAt: user.createdAt,
      deactivatedAt: user.deactivatedAt,
      platformRole: platformUser.role,
      organizationName: organization.name,
    })
    .from(user)
    .leftJoin(platformUser, eq(platformUser.userId, user.id))
    .leftJoin(member, eq(member.userId, user.id))
    .leftJoin(organization, eq(organization.id, member.organizationId))
    .orderBy(desc(user.createdAt))
}

export function findPlatformUserDetailRows(
  executor: DatabaseExecutor,
  userId: string
) {
  return executor
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      image: user.image,
      createdAt: user.createdAt,
      deactivatedAt: user.deactivatedAt,
      deactivatedBy: user.deactivatedBy,
      deactivationReason: user.deactivationReason,
      platformRole: platformUser.role,
      organizationId: organization.id,
      organizationName: organization.name,
      membershipRole: member.role,
    })
    .from(user)
    .leftJoin(platformUser, eq(platformUser.userId, user.id))
    .leftJoin(member, eq(member.userId, user.id))
    .leftJoin(organization, eq(organization.id, member.organizationId))
    .where(eq(user.id, userId))
}

export function findPlatformAccessForUser(
  executor: DatabaseExecutor,
  userId: string
) {
  return executor
    .select({ id: platformUser.id, role: platformUser.role })
    .from(platformUser)
    .where(eq(platformUser.userId, userId))
    .for("update")
}

export function countSuperAdmins(executor: DatabaseExecutor) {
  return executor
    .select({ value: count() })
    .from(platformUser)
    .where(eq(platformUser.role, "super_admin"))
    .for("update")
}

export function updatePlatformAccess(
  executor: DatabaseExecutor,
  platformUserId: string,
  role: string
) {
  return executor
    .update(platformUser)
    .set({ role })
    .where(eq(platformUser.id, platformUserId))
}

export function createPlatformAccess(
  executor: DatabaseExecutor,
  userId: string,
  role: string
) {
  return executor
    .insert(platformUser)
    .values({ userId, role })
    .onConflictDoUpdate({
      target: [platformUser.userId],
      set: { role },
    })
}

export function deletePlatformAccess(
  executor: DatabaseExecutor,
  platformUserId: string
) {
  return executor
    .delete(platformUser)
    .where(eq(platformUser.id, platformUserId))
}

export function createPlatformInvitation(
  executor: DatabaseExecutor,
  data: typeof platformInvitation.$inferInsert
) {
  return executor.insert(platformInvitation).values(data).returning()
}

export function findPlatformInvitationByTokenHash(
  executor: DatabaseExecutor,
  tokenHash: string
) {
  return executor
    .select({
      id: platformInvitation.id,
      email: platformInvitation.email,
      name: platformInvitation.name,
      role: platformInvitation.role,
      tokenHash: platformInvitation.tokenHash,
      status: platformInvitation.status,
      invitedById: platformInvitation.invitedById,
      expiresAt: platformInvitation.expiresAt,
      acceptedAt: platformInvitation.acceptedAt,
      createdAt: platformInvitation.createdAt,
    })
    .from(platformInvitation)
    .where(eq(platformInvitation.tokenHash, tokenHash))
    .limit(1)
}

export function claimPlatformInvitation(
  executor: DatabaseExecutor,
  invitationId: string
) {
  const now = new Date()
  return executor
    .update(platformInvitation)
    .set({ status: "accepted", acceptedAt: now })
    .where(
      and(
        eq(platformInvitation.id, invitationId),
        eq(platformInvitation.status, "pending")
      )
    )
    .returning({ id: platformInvitation.id })
}

export function revokePendingPlatformInvitationsForEmail(
  executor: DatabaseExecutor,
  email: string
) {
  return executor
    .update(platformInvitation)
    .set({ status: "revoked" })
    .where(
      and(
        eq(platformInvitation.email, email),
        eq(platformInvitation.status, "pending")
      )
    )
}

export function appendPlatformAudit(
  executor: DatabaseExecutor,
  data: typeof platformAuditLog.$inferInsert
) {
  return executor.insert(platformAuditLog).values(data)
}

export function listPlatformSuppliers(executor: DatabaseExecutor) {
  return executor
    .select({
      id: supplier.id,
      name: supplier.name,
      phone: supplier.phone,
      email: supplier.email,
      category: supplier.category,
      status: supplier.status,
      createdAt: supplier.createdAt,
      organizationName: organization.name,
    })
    .from(supplier)
    .innerJoin(organization, eq(supplier.organizationId, organization.id))
    .orderBy(desc(supplier.createdAt))
}

export function listPlatformReceipts(executor: DatabaseExecutor) {
  return executor
    .select({
      id: expense.id,
      status: expense.status,
      expenseDate: expense.expenseDate,
      createdAt: expense.createdAt,
      organizationName: organization.name,
      projectName: project.name,
      supplierName: supplier.name,
    })
    .from(expense)
    .innerJoin(organization, eq(expense.organizationId, organization.id))
    .leftJoin(project, eq(expense.projectId, project.id))
    .leftJoin(supplier, eq(expense.supplierId, supplier.id))
    .orderBy(desc(expense.createdAt))
}

export function listPlatformPayments(executor: DatabaseExecutor) {
  return executor
    .select({
      id: payment.id,
      amountCents: payment.amountCents,
      currency: payment.currency,
      paymentDate: payment.paymentDate,
      method: payment.method,
      reference: payment.reference,
      createdAt: payment.createdAt,
      organizationName: organization.name,
      supplierName: supplier.name,
    })
    .from(payment)
    .innerJoin(organization, eq(payment.organizationId, organization.id))
    .leftJoin(supplier, eq(payment.supplierId, supplier.id))
    .orderBy(desc(payment.createdAt))
}

export async function listPlatformProjects(executor: DatabaseExecutor) {
  const projects = await executor.query.project.findMany({
    orderBy: [desc(project.createdAt)],
    with: {
      organization: { columns: { name: true } },
      expenses: { columns: { id: true } },
    },
  })
  const spendStats = await executor
    .select({
      projectId: expense.projectId,
      totalSpendCents: sql<number>`coalesce(sum(${expenseLine.amountCents}), 0)`,
    })
    .from(expense)
    .leftJoin(expenseLine, eq(expense.id, expenseLine.expenseId))
    .where(sql`${expense.projectId} is not null`)
    .groupBy(expense.projectId)
  const spendMap = new Map(
    spendStats.map((row) => [row.projectId, row.totalSpendCents])
  )
  return projects.map((row) => ({
    ...row,
    receiptCount: row.expenses.length,
    organizationName: row.organization?.name || "Unknown",
    totalSpendCents: (row.id && spendMap.get(row.id)) ?? 0,
  }))
}

/**
 * A grant only counts as active while every one of these still holds, so
 * revocation, expiry, losing super admin, and the workspace being suspended
 * all cut access off at the same chokepoint.
 */
function activeGrantConditions(userId: string) {
  return and(
    eq(platformWorkspaceGrant.userId, userId),
    isNull(platformWorkspaceGrant.revokedAt),
    gt(platformWorkspaceGrant.expiresAt, sql`now()`),
    eq(platformUser.role, "super_admin"),
    eq(organization.status, "active")
  )
}

const activeGrantColumns = {
  id: platformWorkspaceGrant.id,
  userId: platformWorkspaceGrant.userId,
  organizationId: platformWorkspaceGrant.organizationId,
  organizationName: organization.name,
  slug: organization.slug,
  role: platformWorkspaceGrant.role,
  expiresAt: platformWorkspaceGrant.expiresAt,
  createdAt: platformWorkspaceGrant.createdAt,
}

export function findActiveGrantForUser(
  executor: DatabaseExecutor,
  userId: string
) {
  return executor
    .select(activeGrantColumns)
    .from(platformWorkspaceGrant)
    .innerJoin(
      organization,
      eq(organization.id, platformWorkspaceGrant.organizationId)
    )
    .innerJoin(
      platformUser,
      eq(platformUser.userId, platformWorkspaceGrant.userId)
    )
    .where(activeGrantConditions(userId))
    .limit(1)
}

/**
 * Every active grant, not just the first. The workspace switcher lists them
 * alongside real memberships, so `findActiveGrantForUser`'s limit(1) — right
 * for resolving a single default — would hide the rest.
 */
export function listActiveGrantsForUser(
  executor: DatabaseExecutor,
  userId: string
) {
  return executor
    .select(activeGrantColumns)
    .from(platformWorkspaceGrant)
    .innerJoin(
      organization,
      eq(organization.id, platformWorkspaceGrant.organizationId)
    )
    .innerJoin(
      platformUser,
      eq(platformUser.userId, platformWorkspaceGrant.userId)
    )
    .where(activeGrantConditions(userId))
}

export function findActiveGrantForUserAndOrg(
  executor: DatabaseExecutor,
  userId: string,
  organizationId: string
) {
  return executor
    .select(activeGrantColumns)
    .from(platformWorkspaceGrant)
    .innerJoin(
      organization,
      eq(organization.id, platformWorkspaceGrant.organizationId)
    )
    .innerJoin(
      platformUser,
      eq(platformUser.userId, platformWorkspaceGrant.userId)
    )
    .where(
      and(
        activeGrantConditions(userId),
        eq(platformWorkspaceGrant.organizationId, organizationId)
      )
    )
    .limit(1)
}

export function insertGrant(
  executor: DatabaseExecutor,
  data: typeof platformWorkspaceGrant.$inferInsert
) {
  return executor.insert(platformWorkspaceGrant).values(data).returning({
    id: platformWorkspaceGrant.id,
    expiresAt: platformWorkspaceGrant.expiresAt,
  })
}

export function revokeGrantsForUser(
  executor: DatabaseExecutor,
  userId: string
) {
  return executor
    .update(platformWorkspaceGrant)
    .set({ revokedAt: new Date() })
    .where(
      and(
        eq(platformWorkspaceGrant.userId, userId),
        isNull(platformWorkspaceGrant.revokedAt)
      )
    )
}

export function revokeGrantById(executor: DatabaseExecutor, grantId: string) {
  return executor
    .update(platformWorkspaceGrant)
    .set({ revokedAt: new Date() })
    .where(eq(platformWorkspaceGrant.id, grantId))
}

// ─────────────────────────────────────────────────────────────────────────────
// Org-scoped admin queries. Every function takes an explicit `organizationId`
// so a super admin browsing a tenant can never accidentally cross tenant lines.
// Use cases in packages/api/src/admin/org-detail.ts compose these.
// ─────────────────────────────────────────────────────────────────────────────

export type AdminProjectSummary = {
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

/**
 * Every project for an org with its budget total (sum of budget_item.budget_cents)
 * and actual spend rollup (sum of expense_line.amount_cents through the project's
 * expenses). Mirrors the per-project numbers the web app shows, but read-only.
 */
export async function listProjectsForOrganizationAdmin(
  executor: DatabaseExecutor,
  organizationId: string
): Promise<AdminProjectSummary[]> {
  const projects = await executor
    .select()
    .from(project)
    .where(eq(project.organizationId, organizationId))
    .orderBy(desc(project.createdAt))

  if (projects.length === 0) return []

  const projectIds = projects.map((p) => p.id)

  const [budgetRows, spendRows, receiptCounts] = await Promise.all([
    executor
      .select({
        projectId: budgetItem.projectId,
        total: sql<number>`coalesce(sum(${budgetItem.budgetCents}), 0)`,
      })
      .from(budgetItem)
      .where(sql`${budgetItem.projectId} in ${projectIds}`)
      .groupBy(budgetItem.projectId),
    executor
      .select({
        projectId: expense.projectId,
        total: sql<number>`coalesce(sum(${expenseLine.amountCents}), 0)`,
      })
      .from(expense)
      .leftJoin(expenseLine, eq(expense.id, expenseLine.expenseId))
      .where(
        and(
          eq(expense.organizationId, organizationId),
          sql`${expense.projectId} in ${projectIds}`
        )
      )
      .groupBy(expense.projectId),
    executor
      .select({
        projectId: expense.projectId,
        count: count(),
      })
      .from(expense)
      .where(
        and(
          eq(expense.organizationId, organizationId),
          sql`${expense.projectId} in ${projectIds}`
        )
      )
      .groupBy(expense.projectId),
  ])

  const budgetMap = new Map(budgetRows.map((r) => [r.projectId, Number(r.total)]))
  const spendMap = new Map(spendRows.map((r) => [r.projectId, Number(r.total)]))
  const receiptMap = new Map(receiptCounts.map((r) => [r.projectId, r.count]))

  return projects.map((p) => ({
    id: p.id,
    name: p.name,
    location: p.location,
    buildingType: p.buildingType,
    status: p.status,
    currency: p.currency,
    createdAt: p.createdAt,
    archivedAt: p.archivedAt,
    budgetCents: budgetMap.get(p.id) ?? 0,
    spentCents: spendMap.get(p.id) ?? 0,
    receiptCount: receiptMap.get(p.id) ?? 0,
  }))
}

export type AdminBudgetItemWithSpend = {
  id: string
  name: string
  budgetCents: number
  spentCents: number
}

/**
 * Budget items for a project with actual spend per item. The shape mirrors the
 * web app's project budget view: budget, spent, remaining, and pct are derived
 * by the caller from budgetCents/spentCents.
 */
export async function listProjectBudgetItemsWithSpend(
  executor: DatabaseExecutor,
  organizationId: string,
  projectId: string
): Promise<AdminBudgetItemWithSpend[]> {
  const items = await executor
    .select()
    .from(budgetItem)
    .where(
      and(
        eq(budgetItem.organizationId, organizationId),
        eq(budgetItem.projectId, projectId)
      )
    )
    .orderBy(desc(budgetItem.createdAt))

  if (items.length === 0) return []

  const itemIds = items.map((i) => i.id)
  const spendRows = await executor
    .select({
      budgetItemId: expenseLine.budgetItemId,
      total: sql<number>`coalesce(sum(${expenseLine.amountCents}), 0)`,
    })
    .from(expenseLine)
    .where(
      and(
        eq(expenseLine.organizationId, organizationId),
        sql`${expenseLine.budgetItemId} in ${itemIds}`
      )
    )
    .groupBy(expenseLine.budgetItemId)

  const spendMap = new Map(spendRows.map((r) => [r.budgetItemId, Number(r.total)]))

  return items.map((i) => ({
    id: i.id,
    name: i.name,
    budgetCents: i.budgetCents,
    spentCents: spendMap.get(i.id) ?? 0,
  }))
}

export type AdminProjectReceipt = {
  id: string
  status: string
  expenseDate: Date | null
  createdAt: Date
  supplierName: string | null
  totalCents: number
  paidCents: number
}

/** Receipts (expenses) for a project with their line totals and paid totals. */
export async function listReceiptsForProjectAdmin(
  executor: DatabaseExecutor,
  organizationId: string,
  projectId: string
): Promise<AdminProjectReceipt[]> {
  const receipts = await executor
    .select({
      id: expense.id,
      status: expense.status,
      expenseDate: expense.expenseDate,
      createdAt: expense.createdAt,
      supplierName: supplier.name,
    })
    .from(expense)
    .leftJoin(
      supplier,
      and(
        eq(supplier.id, expense.supplierId),
        eq(supplier.organizationId, expense.organizationId)
      )
    )
    .where(
      and(
        eq(expense.organizationId, organizationId),
        eq(expense.projectId, projectId)
      )
    )
    .orderBy(desc(expense.createdAt))

  if (receipts.length === 0) return []

  const receiptIds = receipts.map((r) => r.id)
  const [lineTotals, paymentTotals] = await Promise.all([
    executor
      .select({
        expenseId: expenseLine.expenseId,
        total: sql<number>`coalesce(sum(${expenseLine.amountCents}), 0)`,
      })
      .from(expenseLine)
      .where(
        and(
          eq(expenseLine.organizationId, organizationId),
          sql`${expenseLine.expenseId} in ${receiptIds}`
        )
      )
      .groupBy(expenseLine.expenseId),
    executor
      .select({
        expenseId: payment.expenseId,
        total: sql<number>`coalesce(sum(${payment.amountCents}), 0)`,
      })
      .from(payment)
      .where(
        and(
          eq(payment.organizationId, organizationId),
          sql`${payment.expenseId} in ${receiptIds}`
        )
      )
      .groupBy(payment.expenseId),
  ])

  const lineMap = new Map(lineTotals.map((r) => [r.expenseId, Number(r.total)]))
  const paidMap = new Map(paymentTotals.map((r) => [r.expenseId, Number(r.total)]))

  return receipts.map((r) => ({
    id: r.id,
    status: r.status,
    expenseDate: r.expenseDate,
    createdAt: r.createdAt,
    supplierName: r.supplierName,
    totalCents: lineMap.get(r.id) ?? 0,
    paidCents: paidMap.get(r.id) ?? 0,
  }))
}

export type AdminProjectPayment = {
  id: string
  amountCents: number
  currency: string
  paymentDate: Date | null
  method: string | null
  reference: string | null
  createdAt: Date
  supplierName: string | null
  expenseId: string | null
}

/** Payments settling receipts or payables attached to a project. */
export async function listPaymentsForProjectAdmin(
  executor: DatabaseExecutor,
  organizationId: string,
  projectId: string
): Promise<AdminProjectPayment[]> {
  return executor
    .select({
      id: payment.id,
      amountCents: payment.amountCents,
      currency: payment.currency,
      paymentDate: payment.paymentDate,
      method: payment.method,
      reference: payment.reference,
      createdAt: payment.createdAt,
      supplierName: supplier.name,
      expenseId: payment.expenseId,
    })
    .from(payment)
    .leftJoin(
      supplier,
      and(
        eq(supplier.id, payment.supplierId),
        eq(supplier.organizationId, payment.organizationId)
      )
    )
    .leftJoin(expense, eq(expense.id, payment.expenseId))
    .leftJoin(payable, eq(payable.id, payment.payableId))
    .where(
      and(
        eq(payment.organizationId, organizationId),
        or(
          eq(expense.projectId, projectId),
          eq(payable.projectId, projectId)
        )
      )
    )
    .orderBy(desc(payment.createdAt))
}

export type AdminSupplierWithStats = {
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

/** Suppliers for an org with payment aggregates. */
export async function listSuppliersWithPaymentStatsForOrganization(
  executor: DatabaseExecutor,
  organizationId: string
): Promise<AdminSupplierWithStats[]> {
  const suppliers = await executor
    .select()
    .from(supplier)
    .where(eq(supplier.organizationId, organizationId))
    .orderBy(desc(supplier.createdAt))

  if (suppliers.length === 0) return []

  const supplierIds = suppliers.map((s) => s.id)
  const statsRows = await executor
    .select({
      supplierId: payment.supplierId,
      paymentCount: count(),
      totalPaidCents: sql<number>`coalesce(sum(${payment.amountCents}), 0)`,
    })
    .from(payment)
    .where(
      and(
        eq(payment.organizationId, organizationId),
        sql`${payment.supplierId} in ${supplierIds}`
      )
    )
    .groupBy(payment.supplierId)

  const statsMap = new Map(
    statsRows.map((r) => [
      r.supplierId,
      { count: r.paymentCount, total: Number(r.totalPaidCents) },
    ])
  )

  return suppliers.map((s) => {
    const stats = s.id ? statsMap.get(s.id) : undefined
    return {
      id: s.id,
      name: s.name,
      phone: s.phone,
      email: s.email,
      category: s.category,
      status: s.status,
      createdAt: s.createdAt,
      paymentCount: stats?.count ?? 0,
      totalPaidCents: stats?.total ?? 0,
    }
  })
}

export type AdminSupplierPayment = {
  id: string
  amountCents: number
  currency: string
  paymentDate: Date | null
  method: string | null
  reference: string | null
  createdAt: Date
  expenseId: string | null
}

/** Payment history for a single supplier within an org. */
export function listPaymentsForSupplierAdmin(
  executor: DatabaseExecutor,
  organizationId: string,
  supplierId: string
) {
  return executor
    .select({
      id: payment.id,
      amountCents: payment.amountCents,
      currency: payment.currency,
      paymentDate: payment.paymentDate,
      method: payment.method,
      reference: payment.reference,
      createdAt: payment.createdAt,
      expenseId: payment.expenseId,
    })
    .from(payment)
    .where(
      and(
        eq(payment.organizationId, organizationId),
        eq(payment.supplierId, supplierId)
      )
    )
    .orderBy(desc(payment.createdAt))
}
