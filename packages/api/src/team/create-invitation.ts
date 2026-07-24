import { createHash, randomBytes } from "node:crypto"
import type { TransactionRunner } from "@workspace/db/repositories"
import {
  appendAuditEvent,
  createInvitationRecord,
  deleteInvitation,
  findPendingInvitation,
} from "@workspace/db/repositories"
import { z } from "zod"
import { forbidden, validationError } from "../shared/application-error"
import { requireRole } from "../shared/authorization"
import type { WorkspaceContext } from "../shared/workspace-context"

const roleSchema = z.enum(["owner", "site_manager", "accountant", "viewer"])
const inputSchema = z.object({
  email: z.string().trim().email(),
  role: roleSchema,
})

export async function createInvitationUseCase(
  ctx: WorkspaceContext,
  deps: { transaction: TransactionRunner },
  rawInput: unknown
) {
  requireRole(ctx.role, ["owner", "site_manager"])
  const input = inputSchema.safeParse(rawInput)
  if (!input.success) validationError("Enter a valid invitation.")
  if (!canGrantRole(ctx.role, input.data.role))
    forbidden("Only an owner can invite another owner.")

  const normalizedEmail = input.data.email.toLowerCase()
  const token = randomBytes(32).toString("base64url")
  const tokenHash = createHash("sha256").update(token).digest("hex")
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  const invitationId = await deps.transaction(async (tx) => {
    const [existing] = await findPendingInvitation(
      tx,
      ctx.organizationId,
      normalizedEmail
    )
    if (existing) await deleteInvitation(tx, existing.id)
    const created = await createInvitationRecord(tx, {
      organizationId: ctx.organizationId,
      invitedBy: ctx.userId,
      name: normalizedEmail,
      email: normalizedEmail,
      role: input.data.role,
      tokenHash,
      expiresAt,
    })
    if (!created) throw new Error("Invitation insert failed")
    await appendAuditEvent(tx, {
      organizationId: ctx.organizationId,
      actorId: ctx.userId,
      action: "team.invite",
      entityType: "invitation",
      entityId: tokenHash,
      changes: { email: normalizedEmail, role: input.data.role },
    })
    return created.id as string
  })

  return {
    invitationId,
    token,
    tokenHash,
    email: normalizedEmail,
    role: input.data.role,
    expiresAt,
  }
}

function canGrantRole(actorRole: string, targetRole: string) {
  if (actorRole === "owner") return true
  return actorRole === "site_manager" && targetRole !== "owner"
}
