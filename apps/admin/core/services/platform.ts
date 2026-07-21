import "server-only"

import { db } from "@workspace/db"
import { organization, user, expense, project, payment } from "@workspace/db/schema"
import { count, eq, sql } from "drizzle-orm"

export async function getPlatformStats() {
  const [
    totalOrgsResult,
    activeOrgsResult,
    trialOrgsResult,
    suspendedOrgsResult,
    totalUsersResult,
    totalProjectsResult,
    totalReceiptsResult,
    totalPaymentsResult
  ] = await Promise.all([
    db.select({ count: count() }).from(organization),
    db.select({ count: count() }).from(organization).where(eq(organization.status, "active")),
    db.select({ count: count() }).from(organization).where(eq(organization.status, "trial")),
    db.select({ count: count() }).from(organization).where(eq(organization.status, "suspended")),
    db.select({ count: count() }).from(user),
    db.select({ count: count() }).from(project),
    db.select({ count: count() }).from(expense),
    db.select({ count: count() }).from(payment),
  ])

  // MRR placeholder
  const mrrPlaceholder = 12500
  // Failed payments placeholder
  const failedPaymentsPlaceholder = 3
  
  return {
    totalOrganizations: totalOrgsResult[0]?.count ?? 0,
    activeOrganizations: activeOrgsResult[0]?.count ?? 0,
    trialOrganizations: trialOrgsResult[0]?.count ?? 0,
    suspendedOrganizations: suspendedOrgsResult[0]?.count ?? 0,
    totalUsers: totalUsersResult[0]?.count ?? 0,
    mrr: mrrPlaceholder,
    failedPayments: failedPaymentsPlaceholder,
    totalReceipts: totalReceiptsResult[0]?.count ?? 0,
    totalProjects: totalProjectsResult[0]?.count ?? 0,
    totalPayments: totalPaymentsResult[0]?.count ?? 0,
    organizationsNeedingAttention: 0, // Placeholder
  }
}
