import "server-only"

import { db } from "@workspace/db"
import { organization, user, expense, project, payment } from "@workspace/db/schema"
import { count, eq } from "drizzle-orm"

export async function getPlatformStats() {
  const [
    totalOrgsResult,
    activeOrgsResult,
    trialOrgsResult,
    suspendedOrgsResult,
    totalUsersResult,
    totalProjectsResult,
    totalReceiptsResult,
    totalPaymentsResult,
    failedPaymentsResult,
  ] = await Promise.all([
    db.select({ count: count() }).from(organization),
    db.select({ count: count() }).from(organization).where(eq(organization.status, "active")),
    db.select({ count: count() }).from(organization).where(eq(organization.status, "trial")),
    db.select({ count: count() }).from(organization).where(eq(organization.status, "suspended")),
    db.select({ count: count() }).from(user),
    db.select({ count: count() }).from(project),
    db.select({ count: count() }).from(expense),
    db.select({ count: count() }).from(payment),
    db.select({ count: count() }).from(payment).where(eq(payment.method, "failed")),
  ])

  return {
    totalOrganizations: totalOrgsResult[0]?.count ?? 0,
    activeOrganizations: activeOrgsResult[0]?.count ?? 0,
    trialOrganizations: trialOrgsResult[0]?.count ?? 0,
    suspendedOrganizations: suspendedOrgsResult[0]?.count ?? 0,
    totalUsers: totalUsersResult[0]?.count ?? 0,
    totalReceipts: totalReceiptsResult[0]?.count ?? 0,
    totalProjects: totalProjectsResult[0]?.count ?? 0,
    totalPayments: totalPaymentsResult[0]?.count ?? 0,
    failedPayments: failedPaymentsResult[0]?.count ?? 0,
    organizationsNeedingAttention:
      (suspendedOrgsResult[0]?.count ?? 0) + (trialOrgsResult[0]?.count ?? 0),
  }
}
