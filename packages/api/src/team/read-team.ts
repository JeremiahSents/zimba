import { createHash } from "node:crypto"
import { db } from "@workspace/db"

import {
  findInvitationPreviewByTokenHash,
  listPendingInvitations,
  listTeamMembers,
} from "@workspace/db/repositories"
import { validationError } from "../shared/application-error"
import type { WorkspaceContext } from "../shared/workspace-context"

export async function listTeamUseCase(
  ctx: Pick<WorkspaceContext, "organizationId">
) {
  const [members, invitations] = await Promise.all([
    listTeamMembers(db, ctx.organizationId),
    listPendingInvitations(db, ctx.organizationId),
  ])

  return { members, invitations }
}

export async function getInvitationPreviewUseCase(rawToken: unknown) {
  if (typeof rawToken !== "string" || rawToken.length < 20)
    validationError("This invitation link is invalid.")

  const tokenHash = createHash("sha256").update(rawToken).digest("hex")
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
