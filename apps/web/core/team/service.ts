import "server-only"

import { createHash, randomBytes } from "node:crypto"
import { db } from "@workspace/db"
import {
  appendAuditEvent,
  claimInvitationAndUpsertMember,
  createInvitationRecord,
  deleteInvitation,
  findInvitationByTokenHash,
  findInvitationPreviewByTokenHash,
  findPendingInvitation,
  listPendingInvitations,
  listTeamMembers,
} from "@workspace/db/repositories"
import { sendMemberInviteEmail } from "@workspace/transactional"
import {
  canGrantRole,
  normalizeRole,
  requireRole,
  type WorkspaceRole,
} from "../auth/permissions"
import { requireSession } from "../auth/service"
import { badRequest, forbidden, notFound } from "../shared/errors"
import { buildInviteUrl } from "./invite-url"

export async function listTeam() {
  const { organization } = await requireSession()
  const members = await listTeamMembers(db, organization.organizationId)
  const invitations = await listPendingInvitations(
    db,
    organization.organizationId
  )
  return {
    members,
    invitations,
    canInvite: ["owner", "site_manager"].includes(
      normalizeRole(organization.role)
    ),
  }
}

export async function createInvitation(input: {
  email: string
  role: WorkspaceRole
}) {
  const { user, organization } = await requireSession()
  requireRole(organization.role, ["owner", "site_manager"])
  if (!canGrantRole(organization.role, input.role))
    forbidden("Only an owner can invite another owner.")
  const normalizedEmail = input.email.trim().toLowerCase()
  if (!normalizedEmail.includes("@")) badRequest("Enter a valid email address.")
  const [existing] = await findPendingInvitation(
    db,
    organization.organizationId,
    normalizedEmail
  )
  if (existing) await deleteInvitation(db, existing.id)
  const token = randomBytes(32).toString("base64url")
  const tokenHash = createHash("sha256").update(token).digest("hex")
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const inviteUrl = buildInviteUrl(token)
  await createInvitationRecord(db, {
    organizationId: organization.organizationId,
    invitedBy: user.id,
    name: normalizedEmail,
    email: normalizedEmail,
    role: input.role,
    tokenHash,
    expiresAt,
  })
  try {
    await sendMemberInviteEmail({
      to: normalizedEmail,
      invitedByName: user.name,
      organizationName: organization.organizationName,
      role: input.role,
      inviteUrl,
    })
  } catch (error) {
    await deleteInvitation(db, tokenHash)
    throw error
  }
  await appendAuditEvent(db, {
    organizationId: organization.organizationId,
    actorId: user.id,
    action: "team.invite",
    entityType: "invitation",
    entityId: tokenHash,
    changes: { email: normalizedEmail, role: input.role },
  })
  return token
}

export async function acceptInvitation(token: string) {
  const { user } = await requireSession()
  const tokenHash = createHash("sha256").update(token).digest("hex")
  const [invite] = await findInvitationByTokenHash(db, tokenHash)
  if (!invite || invite.expiresAt < new Date())
    notFound("This invitation is invalid or expired.")
  if (invite.email !== user.email.toLowerCase())
    forbidden("Sign in with the email address that was invited.")
  if (invite.status === "accepted" && invite.acceptedBy === user.id) return
  if (invite.status !== "pending")
    notFound("This invitation is no longer available.")
  await db.transaction(async (tx) => {
    await claimInvitationAndUpsertMember(
      tx,
      invite.id,
      user.id,
      invite.organizationId,
      invite.role,
      invite.responsibility
    )
  })
}

export async function getInvitationPreview(token: string) {
  const tokenHash = createHash("sha256").update(token).digest("hex")
  const [invite] = await findInvitationPreviewByTokenHash(db, tokenHash)
  if (!invite) return { state: "invalid" as const }
  const preview = {
    organizationName: invite.organizationName,
    email: invite.email,
    status: invite.status,
    expiresAt: invite.expiresAt,
  }
  if (invite.status === "accepted")
    return { state: "used" as const, ...preview }
  if (invite.expiresAt < new Date())
    return { state: "expired" as const, ...preview }
  return { state: "pending" as const, ...preview }
}
