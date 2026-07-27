import { createHash } from "node:crypto"
import { db } from "@workspace/db"

import {
  claimInvitationAndUpsertMember,
  findInvitationByTokenHash,
  findOrganizationById,
} from "@workspace/db/repositories"
import {
  conflictError,
  forbidden,
  notFoundError,
  validationError,
} from "../shared/application-error"

export type InvitationAcceptanceContext = { userId: string; email: string }

export async function acceptInvitationUseCase(
  ctx: InvitationAcceptanceContext,
  rawToken: unknown
): Promise<{ workspaceSlug: string }> {
  if (typeof rawToken !== "string" || rawToken.length < 20)
    validationError("This invitation link is invalid.")
  const tokenHash = createHash("sha256").update(rawToken).digest("hex")
  const [invite] = await findInvitationByTokenHash(db, tokenHash)
  if (!invite) notFoundError("This invitation is invalid or expired.")
  if (invite.expiresAt <= new Date())
    notFoundError("This invitation is invalid or expired.")
  if (invite.email.toLowerCase() !== ctx.email.trim().toLowerCase())
    forbidden("This invitation is for a different account.")
  const [workspace] = await findOrganizationById(db, invite.organizationId)
  if (workspace?.status !== "active")
    notFoundError("This invitation is invalid or expired.")
  if (invite.status !== "pending")
    conflictError("This invitation has already been used.")
  const claimed = await db.transaction((tx) =>
    claimInvitationAndUpsertMember(
      tx,
      invite.id,
      ctx.userId,
      invite.organizationId,
      invite.role,
      invite.responsibility
    )
  )
  if (!claimed) conflictError("This invitation has already been used.")
  return { workspaceSlug: workspace.slug }
}
