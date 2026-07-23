import { and, count, desc, eq, gt, sql } from "drizzle-orm"
import { user } from "../schemas/auth-schema"
import {
  invitation,
  member,
  organization,
  organizationMember,
} from "../schemas/organization-schema"
import { project } from "../schemas/project-schema"
import { expense, expenseLine, payment } from "../schemas/receipt-schema"
import { supplier } from "../schemas/supplier-schema"
import type { DatabaseExecutor } from "./types"

export function findOrganizationById(
  executor: DatabaseExecutor,
  organizationId: string
) {
  return executor
    .select()
    .from(organization)
    .where(eq(organization.id, organizationId))
    .limit(1)
}

export function listOrganizationMembers(
  executor: DatabaseExecutor,
  organizationId: string
) {
  return executor
    .select()
    .from(organizationMember)
    .where(eq(organizationMember.organizationId, organizationId))
}

export function findUserOrganizationMembership(
  executor: DatabaseExecutor,
  userId: string
) {
  return executor
    .select({
      organizationId: organizationMember.organizationId,
      organizationName: organization.name,
      slug: organization.slug,
      role: organizationMember.role,
    })
    .from(organizationMember)
    .innerJoin(
      organization,
      eq(organization.id, organizationMember.organizationId)
    )
    .where(eq(organizationMember.userId, userId))
    .limit(1)
}

export function findMembershipByUser(
  executor: DatabaseExecutor,
  userId: string
) {
  return executor
    .select({ id: member.id })
    .from(member)
    .where(eq(member.userId, userId))
    .limit(1)
}

export function findOrganizationBySlug(
  executor: DatabaseExecutor,
  slug: string
) {
  return executor
    .select({ id: organization.id })
    .from(organization)
    .where(eq(organization.slug, slug))
    .limit(1)
}

export function createOrganization(
  executor: DatabaseExecutor,
  data: typeof organization.$inferInsert
) {
  return executor.insert(organization).values(data)
}

export function createOrganizationMember(
  executor: DatabaseExecutor,
  data: typeof member.$inferInsert
) {
  return executor.insert(member).values(data)
}

export async function readOrganizationStats(
  executor: DatabaseExecutor,
  organizationId: string
) {
  const [expenseStats, paymentStats, supplierCount, projectCount, memberCount] =
    await Promise.all([
      executor
        .select({
          expenseCount: count(),
          totalSpendCents: sql<number>`coalesce(sum(${expenseLine.amountCents}), 0)`,
        })
        .from(expense)
        .leftJoin(expenseLine, eq(expense.id, expenseLine.expenseId))
        .where(eq(expense.organizationId, organizationId)),
      executor
        .select({
          paymentCount: count(),
          totalPaidCents: sql<number>`coalesce(sum(${payment.amountCents}), 0)`,
        })
        .from(payment)
        .where(eq(payment.organizationId, organizationId)),
      executor
        .select({ count: count() })
        .from(supplier)
        .where(eq(supplier.organizationId, organizationId)),
      executor
        .select({ count: count() })
        .from(project)
        .where(eq(project.organizationId, organizationId)),
      executor
        .select({ count: count() })
        .from(organizationMember)
        .where(eq(organizationMember.organizationId, organizationId)),
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

export async function updateOrganizationStatus(
  executor: DatabaseExecutor,
  organizationId: string,
  status: string
) {
  const [updated] = await executor
    .update(organization)
    .set({ status, updatedAt: new Date() })
    .where(eq(organization.id, organizationId))
    .returning()
  return updated ?? null
}

export async function listOrganizationsWithStats(executor: DatabaseExecutor) {
  const orgs = await executor.query.organization.findMany({
    orderBy: [desc(organization.createdAt)],
    with: {
      members: { columns: { id: true } },
      projects: { columns: { id: true } },
    },
  })
  const expenseStats = await executor
    .select({
      organizationId: expense.organizationId,
      expenseCount: count(),
      totalSpendCents: sql<number>`coalesce(sum(${expenseLine.amountCents}), 0)`,
    })
    .from(expense)
    .leftJoin(expenseLine, eq(expense.id, expenseLine.expenseId))
    .groupBy(expense.organizationId)
  const statsMap = new Map(expenseStats.map((row) => [row.organizationId, row]))
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

export function findOrganizationDetail(
  executor: DatabaseExecutor,
  organizationId: string
) {
  return executor.query.organization.findFirst({
    where: eq(organization.id, organizationId),
    with: {
      members: { with: { user: true } },
      projects: true,
      suppliers: true,
    },
  })
}

export function listTeamMembers(
  executor: DatabaseExecutor,
  organizationId: string
) {
  return executor
    .select({
      id: member.id,
      name: user.name,
      email: user.email,
      role: member.role,
      responsibility: member.responsibility,
    })
    .from(member)
    .innerJoin(user, eq(user.id, member.userId))
    .where(eq(member.organizationId, organizationId))
}

export function listPendingInvitations(
  executor: DatabaseExecutor,
  organizationId: string
) {
  return executor
    .select()
    .from(invitation)
    .where(
      and(
        eq(invitation.organizationId, organizationId),
        eq(invitation.status, "pending")
      )
    )
    .orderBy(desc(invitation.createdAt))
}

export function findPendingInvitation(
  executor: DatabaseExecutor,
  organizationId: string,
  email: string
) {
  return executor
    .select({ id: invitation.id })
    .from(invitation)
    .where(
      and(
        eq(invitation.organizationId, organizationId),
        eq(invitation.email, email),
        eq(invitation.status, "pending")
      )
    )
    .limit(1)
}

export function deleteInvitation(
  executor: DatabaseExecutor,
  invitationId: string
) {
  return executor.delete(invitation).where(eq(invitation.id, invitationId))
}

export function createInvitationRecord(
  executor: DatabaseExecutor,
  data: typeof invitation.$inferInsert
) {
  return executor.insert(invitation).values(data)
}

export function findInvitationByTokenHash(
  executor: DatabaseExecutor,
  tokenHash: string
) {
  return executor
    .select()
    .from(invitation)
    .where(eq(invitation.tokenHash, tokenHash))
    .limit(1)
}

export function findInvitationPreviewByTokenHash(
  executor: DatabaseExecutor,
  tokenHash: string
) {
  return executor
    .select({
      organizationName: organization.name,
      email: invitation.email,
      status: invitation.status,
      expiresAt: invitation.expiresAt,
    })
    .from(invitation)
    .innerJoin(organization, eq(organization.id, invitation.organizationId))
    .where(eq(invitation.tokenHash, tokenHash))
    .limit(1)
}

export async function claimInvitationAndUpsertMember(
  executor: DatabaseExecutor,
  invitationId: string,
  userId: string,
  organizationId: string,
  role: string,
  responsibility: string | null | undefined
) {
  const now = new Date()
  const claimed = await executor
    .update(invitation)
    .set({ status: "accepted", acceptedBy: userId, acceptedAt: now })
    .where(
      and(
        eq(invitation.id, invitationId),
        eq(invitation.status, "pending"),
        gt(invitation.expiresAt, now)
      )
    )
    .returning({ id: invitation.id })
  if (!claimed[0]) return false
  await executor
    .insert(member)
    .values({
      id: crypto.randomUUID(),
      organizationId,
      userId,
      role,
      responsibility,
    })
    .onConflictDoUpdate({
      target: [member.organizationId, member.userId],
      set: { role, responsibility },
    })
  return true
}

export async function findWorkspaceBySlug(
  executor: DatabaseExecutor,
  slug: string
) {
  const [row] = await executor
    .select({
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      status: organization.status,
    })
    .from(organization)
    .where(eq(organization.slug, slug))
    .limit(1)
  return row ?? null
}

export async function findMembershipByUserAndOrganization(
  executor: DatabaseExecutor,
  userId: string,
  organizationId: string
) {
  const [row] = await executor
    .select({
      id: organizationMember.id,
      role: organizationMember.role,
    })
    .from(organizationMember)
    .where(
      and(
        eq(organizationMember.userId, userId),
        eq(organizationMember.organizationId, organizationId)
      )
    )
    .limit(1)
  return row ?? null
}

export async function isSlugAvailable(
  executor: DatabaseExecutor,
  slug: string,
  excludeOrganizationId?: string
) {
  const conditions = [eq(organization.slug, slug)]
  if (excludeOrganizationId)
    conditions.push(sql`${organization.id} != ${excludeOrganizationId}`)
  const [row] = await executor
    .select({ value: count() })
    .from(organization)
    .where(and(...conditions))
  return Number(row?.value ?? 0) === 0
}

export async function findUserMemberships(
  executor: DatabaseExecutor,
  userId: string
) {
  return executor
    .select({
      organizationId: organization.id,
      organizationName: organization.name,
      slug: organization.slug,
      role: organizationMember.role,
    })
    .from(organizationMember)
    .innerJoin(
      organization,
      eq(organization.id, organizationMember.organizationId)
    )
    .where(eq(organizationMember.userId, userId))
}
