import "server-only"

import { createHash, randomBytes } from "node:crypto"
import { and, desc, eq } from "drizzle-orm"
import { requireSession } from "../auth/service"
import { canGrantRole, normalizeRole, requireRole, type WorkspaceRole } from "../auth/permissions"
import { badRequest, forbidden, notFound } from "../shared/errors"
import { db, schema } from "../shared/db"

export async function listTeam() {
  const { organization } = await requireSession()
  const members = await db.select({ id: schema.member.id, name: schema.user.name, email: schema.user.email, role: schema.member.role, responsibility: schema.member.responsibility }).from(schema.member).innerJoin(schema.user, eq(schema.user.id, schema.member.userId)).where(eq(schema.member.organizationId, organization.organizationId))
  const invitations = await db.select().from(schema.invitation).where(and(eq(schema.invitation.organizationId, organization.organizationId), eq(schema.invitation.status, "pending"))).orderBy(desc(schema.invitation.createdAt))
  return { members, invitations, canInvite: ["owner", "site_manager"].includes(normalizeRole(organization.role)) }
}

export async function createInvitation(input: { name: string; email: string; role: WorkspaceRole; responsibility?: string }) {
  const { user, organization } = await requireSession()
  requireRole(organization.role, ["owner", "site_manager"])
  if (!canGrantRole(organization.role, input.role)) forbidden("Only an owner can invite another owner.")
  if (!input.name.trim() || !input.email.includes("@")) badRequest("Enter a name and valid email address.")
  const token = randomBytes(32).toString("base64url")
  const tokenHash = createHash("sha256").update(token).digest("hex")
  await db.insert(schema.invitation).values({ organizationId: organization.organizationId, invitedBy: user.id, name: input.name.trim(), email: input.email.trim().toLowerCase(), role: input.role, responsibility: input.responsibility?.trim(), tokenHash, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) })
  return token
}

export async function acceptInvitation(token: string) {
  const { user } = await requireSession()
  const tokenHash = createHash("sha256").update(token).digest("hex")
  const [invite] = await db.select().from(schema.invitation).where(and(eq(schema.invitation.tokenHash, tokenHash), eq(schema.invitation.status, "pending"))).limit(1)
  if (!invite || invite.expiresAt < new Date()) notFound("This invitation is invalid or expired.")
  if (invite.email !== user.email.toLowerCase()) forbidden("Sign in with the email address that was invited.")
  await db.transaction(async (tx) => {
    await tx.insert(schema.member).values({ id: crypto.randomUUID(), organizationId: invite.organizationId, userId: user.id, role: invite.role, responsibility: invite.responsibility }).onConflictDoUpdate({ target: [schema.member.organizationId, schema.member.userId], set: { role: invite.role, responsibility: invite.responsibility } })
    await tx.update(schema.invitation).set({ status: "accepted", acceptedAt: new Date() }).where(eq(schema.invitation.id, invite.id))
  })
}
