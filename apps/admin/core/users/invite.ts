import "server-only"

import { createSuperAdminInviteUseCase } from "@workspace/api"
import { sendSuperAdminInviteEmail } from "@workspace/transactional"
import { env } from "@/core/shared/env"
import { requirePlatformRole } from "../auth/service"

function buildAdminInviteUrl(token: string): string {
  const base = env.BETTER_AUTH_URL ?? "http://localhost:4000"
  return `${base.replace(/\/+$/, "")}/accept-invite?token=${encodeURIComponent(token)}`
}

export async function sendSuperAdminInvite(input: {
  email: string
  name: string
}): Promise<void> {
  const session = await requirePlatformRole(["super_admin"])
  const invite = await createSuperAdminInviteUseCase(session.user.id, input)

  const inviteUrl = buildAdminInviteUrl(invite.token)

  await sendSuperAdminInviteEmail({
    to: invite.normalizedEmail,
    invitedByName: session.user.name,
    inviteUrl,
    recipientEmail: invite.normalizedEmail,
  })
}
