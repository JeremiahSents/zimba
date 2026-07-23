import { count, desc, eq, sql } from "drizzle-orm"
import {
  organization,
  organizationMember,
} from "../schemas/organization-schema"
import { expense, expenseLine, payment } from "../schemas/receipt-schema"
import { project } from "../schemas/project-schema"
import { user } from "../schemas/auth-schema"
import { platformAuditLog, platformUser } from "../schemas/platform-schema"
import { supplier } from "../schemas/supplier-schema"
import type { DatabaseExecutor } from "./types"

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
      platformRole: platformUser.role,
      organizationName: organization.name,
    })
    .from(user)
    .leftJoin(platformUser, eq(platformUser.userId, user.id))
    .leftJoin(organizationMember, eq(organizationMember.userId, user.id))
    .leftJoin(
      organization,
      eq(organization.id, organizationMember.organizationId)
    )
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
      platformRole: platformUser.role,
      organizationId: organization.id,
      organizationName: organization.name,
      membershipRole: organizationMember.role,
    })
    .from(user)
    .leftJoin(platformUser, eq(platformUser.userId, user.id))
    .leftJoin(organizationMember, eq(organizationMember.userId, user.id))
    .leftJoin(
      organization,
      eq(organization.id, organizationMember.organizationId)
    )
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
  return executor.insert(platformUser).values({ userId, role })
}

export function deletePlatformAccess(
  executor: DatabaseExecutor,
  platformUserId: string
) {
  return executor
    .delete(platformUser)
    .where(eq(platformUser.id, platformUserId))
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
      paymentStatus: expense.paymentStatus,
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

export async function listPlatformProjects(
  executor: DatabaseExecutor
): Promise<Array<Record<string, any>>> {
  const relational = executor as any
  const projects = await relational.query.project.findMany({
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
  return projects.map((row: any) => ({
    ...row,
    receiptCount: row.expenses.length,
    organizationName: row.organization?.name || "Unknown",
    totalSpendCents: (row.id && spendMap.get(row.id)) ?? 0,
  }))
}
