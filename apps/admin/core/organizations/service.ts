import "server-only"
import { db } from "@workspace/db"
import { organization, organizationMember, project, expense, expenseLine, supplier, payment } from "@workspace/db/schema"
import { count, desc, eq, sql } from "drizzle-orm"
import { notFound } from "../shared/errors"
import { requirePlatformRole } from "../auth/service"

export async function listOrganizations() {
  const orgs = await db.query.organization.findMany({
    orderBy: [desc(organization.createdAt)],
    with: {
      members: {
        columns: { id: true }
      },
      projects: {
        columns: { id: true }
      }
    }
  })

  const expenseStats = await db
    .select({
      organizationId: expense.organizationId,
      expenseCount: count(),
      totalSpendCents: sql<number>`coalesce(sum(${expenseLine.amountCents}), 0)`,
    })
    .from(expense)
    .leftJoin(expenseLine, eq(expense.id, expenseLine.expenseId))
    .groupBy(expense.organizationId)

  const statsMap = new Map(expenseStats.map((s) => [s.organizationId, s]))

  return orgs.map((org) => {
    const stats = statsMap.get(org.id)
    return {
      ...org,
      userCount: org.members.length,
      projectCount: org.projects.length,
      expenseCount: stats?.expenseCount ?? 0,
      totalSpendCents: stats?.totalSpendCents ?? 0,
    }
  })
}

export async function getOrganizationDetail(id: string) {
  const org = await db.query.organization.findFirst({
    where: eq(organization.id, id),
    with: {
      members: {
        with: {
          user: true
        }
      },
      projects: true,
      suppliers: true
    }
  })

  if (!org) notFound("Organization not found.")

  return org
}

export async function getOrganizationStats(id: string) {
  const [expenseStats, paymentStats, supplierCount, projectCount, memberCount] = await Promise.all([
    db
      .select({
        expenseCount: count(),
        totalSpendCents: sql<number>`coalesce(sum(${expenseLine.amountCents}), 0)`,
      })
      .from(expense)
      .leftJoin(expenseLine, eq(expense.id, expenseLine.expenseId))
      .where(eq(expense.organizationId, id)),
    db
      .select({
        paymentCount: count(),
        totalPaidCents: sql<number>`coalesce(sum(${payment.amountCents}), 0)`,
      })
      .from(payment)
      .where(eq(payment.organizationId, id)),
    db.select({ count: count() }).from(supplier).where(eq(supplier.organizationId, id)),
    db.select({ count: count() }).from(project).where(eq(project.organizationId, id)),
    db.select({ count: count() }).from(organizationMember).where(eq(organizationMember.organizationId, id)),
  ])

  return {
    expenseCount: expenseStats[0]?.expenseCount ?? 0,
    totalSpendCents: expenseStats[0]?.totalSpendCents ?? 0,
    paymentCount: paymentStats[0]?.paymentCount ?? 0,
    totalPaidCents: paymentStats[0]?.totalPaidCents ?? 0,
    supplierCount: supplierCount[0]?.count ?? 0,
    projectCount: projectCount[0]?.count ?? 0,
    memberCount: memberCount[0]?.count ?? 0,
  }
}

export async function updateOrganizationStatus(id: string, status: string) {
  await requirePlatformRole(["super_admin"])
  const [updated] = await db
    .update(organization)
    .set({ status, updatedAt: new Date() })
    .where(eq(organization.id, id))
    .returning()

  return updated ?? null
}
