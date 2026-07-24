import "server-only"

import { validateSuperAdminInviteUseCase } from "@workspace/api"
import { apiExecutor } from "@workspace/api-runtime"
import { sendSuperAdminInviteEmail } from "@workspace/transactional"
import { requirePlatformRole } from "../auth/service"

function buildAdminInviteUrl(token: string): string {
  const base =
    process.env.APP_URL ??
    process.env.BETTER_AUTH_URL ??
    "http://localhost:4000"
  return `${base.replace(/\/+$/, "")}/settings?invite=${token}`
}

export async function sendSuperAdminInvite(input: {
  email: string
  name: string
}): Promise<void> {
  const session = await requirePlatformRole(["super_admin"])
  const invite = await validateSuperAdminInviteUseCase(apiExecutor, input)

  const inviteToken = `${invite.existingUserId ?? "new"}:${Buffer.from(
    invite.normalizedEmail
  ).toString("base64url")}:${crypto.randomUUID()}`

  const inviteUrl = buildAdminInviteUrl(inviteToken)

  await sendSuperAdminInviteEmail({
    to: invite.normalizedEmail,
    invitedByName: session.user.name,
    inviteUrl,
    recipientEmail: invite.normalizedEmail,
  })
}
