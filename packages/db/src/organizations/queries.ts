import {
  and,
  count,
  desc,
  eq,
  gt,
  isNotNull,
  ne,
  notExists,
  sql,
} from "drizzle-orm"
import { alias } from "drizzle-orm/pg-core"
import { user } from "../auth/schema"
import { project } from "../projects/schema"
import { expense, expenseLine, payment } from "../receipts/schema"
import type { DatabaseExecutor } from "../shared/executor"
import { supplier } from "../suppliers/schema"
import { invitation, member, organization } from "./schema"

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
    .from(member)
    .where(eq(member.organizationId, organizationId))
}

export function findUserOrganizationMembership(
  executor: DatabaseExecutor,
  userId: string
) {
  return executor
    .select({
      organizationId: member.organizationId,
      organizationName: organization.name,
      slug: organization.slug,
      role: member.role,
    })
    .from(member)
    .innerJoin(organization, eq(organization.id, member.organizationId))
    .where(eq(member.userId, userId))
    .limit(1)
}

export function findUserOrganizationMembershipBySlug(
  executor: DatabaseExecutor,
  userId: string,
  slug: string
) {
  return executor
    .select({
      organizationId: member.organizationId,
      organizationName: organization.name,
      slug: organization.slug,
      role: member.role,
    })
    .from(member)
    .innerJoin(organization, eq(organization.id, member.organizationId))
    .where(
      and(
        eq(member.userId, userId),
        eq(organization.slug, slug),
        eq(organization.status, "active")
      )
    )
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
        .where(
          and(
            eq(payment.organizationId, organizationId),
            isNotNull(payment.expenseId)
          )
        ),
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
        .from(member)
        .where(eq(member.organizationId, organizationId)),
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
      userId: member.userId,
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
    .select({
      id: invitation.id,
      organizationId: invitation.organizationId,
      invitedBy: invitation.invitedBy,
      name: invitation.name,
      email: invitation.email,
      role: invitation.role,
      responsibility: invitation.responsibility,
      tokenHash: invitation.tokenHash,
      status: invitation.status,
      expiresAt: invitation.expiresAt,
      acceptedAt: invitation.acceptedAt,
      createdAt: invitation.createdAt,
    })
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

export function deleteInvitationForOrganization(
  executor: DatabaseExecutor,
  organizationId: string,
  invitationId: string
) {
  return executor
    .delete(invitation)
    .where(
      and(
        eq(invitation.id, invitationId),
        eq(invitation.organizationId, organizationId)
      )
    )
    .returning()
}

export async function createInvitationRecord(
  executor: DatabaseExecutor,
  data: typeof invitation.$inferInsert
) {
  const [created] = await executor.insert(invitation).values(data).returning()
  return created
}

export function findPendingInvitationByTokenHash(
  executor: DatabaseExecutor,
  tokenHash: string
) {
  return executor
    .select({
      id: invitation.id,
      organizationId: invitation.organizationId,
      invitedBy: invitation.invitedBy,
      name: invitation.name,
      email: invitation.email,
      role: invitation.role,
      responsibility: invitation.responsibility,
      tokenHash: invitation.tokenHash,
      status: invitation.status,
      expiresAt: invitation.expiresAt,
      acceptedAt: invitation.acceptedAt,
      createdAt: invitation.createdAt,
    })
    .from(invitation)
    .where(eq(invitation.tokenHash, tokenHash))
    .limit(1)
}

export function findInvitationByTokenHash(
  executor: DatabaseExecutor,
  tokenHash: string
) {
  return executor
    .select({
      id: invitation.id,
      organizationId: invitation.organizationId,
      invitedBy: invitation.invitedBy,
      name: invitation.name,
      email: invitation.email,
      role: invitation.role,
      responsibility: invitation.responsibility,
      tokenHash: invitation.tokenHash,
      status: invitation.status,
      expiresAt: invitation.expiresAt,
      acceptedAt: invitation.acceptedAt,
      createdAt: invitation.createdAt,
    })
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
    .set({ status: "accepted", acceptedAt: now })
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
  const rows = await executor
    .select({
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      status: organization.status,
    })
    .from(organization)
    .where(eq(organization.slug, slug))
    .limit(1)
  return rows.at(0) ?? null
}

export async function findMembershipByUserAndOrganization(
  executor: DatabaseExecutor,
  userId: string,
  organizationId: string
) {
  const rows = await executor
    .select({
      id: member.id,
      role: member.role,
    })
    .from(member)
    .where(
      and(eq(member.userId, userId), eq(member.organizationId, organizationId))
    )
    .limit(1)
  return rows.at(0) ?? null
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
      role: member.role,
    })
    .from(member)
    .innerJoin(organization, eq(organization.id, member.organizationId))
    .where(eq(member.userId, userId))
}

/**
 * Organizations this user owns and would leave ownerless. An organization with
 * a second owner is safe to walk away from; one without is the blocker that
 * stops an account from being deleted.
 */
export function findSoleOwnerOrganizationsForUser(
  executor: DatabaseExecutor,
  userId: string
) {
  const otherOwner = alias(member, "other_owner")
  return executor
    .select({
      organizationId: organization.id,
      organizationName: organization.name,
      slug: organization.slug,
      status: organization.status,
    })
    .from(member)
    .innerJoin(organization, eq(organization.id, member.organizationId))
    .where(
      and(
        eq(member.userId, userId),
        eq(member.role, "owner"),
        notExists(
          executor
            .select({ one: sql`1` })
            .from(otherOwner)
            .where(
              and(
                eq(otherOwner.organizationId, member.organizationId),
                eq(otherOwner.role, "owner"),
                ne(otherOwner.userId, userId)
              )
            )
        )
      )
    )
}

/** Live invitations the user sent, which survive them as the organization's. */
export async function countPendingInvitationsFromUser(
  executor: DatabaseExecutor,
  userId: string
) {
  const [row] = await executor
    .select({ value: count() })
    .from(invitation)
    .where(
      and(eq(invitation.invitedBy, userId), eq(invitation.status, "pending"))
    )
  return Number(row?.value ?? 0)
}

export async function updateMemberRole(
  executor: DatabaseExecutor,
  memberId: string,
  role: string
) {
  const [updated] = await executor
    .update(member)
    .set({ role, updatedAt: new Date() })
    .where(eq(member.id, memberId))
    .returning()
  return updated ?? null
}
