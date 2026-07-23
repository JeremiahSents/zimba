import "server-only"

import { db } from "@workspace/db"
import {
  findPlatformUserForUser,
  findUserByEmail,
} from "@workspace/db/repositories"
import { sendSuperAdminInviteEmail } from "@workspace/transactional"
import { requirePlatformRole } from "../auth/service"
import { badRequest, conflict } from "../shared/errors"

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

  const normalizedEmail = input.email.trim().toLowerCase()

  if (!input.name.trim() || !normalizedEmail.includes("@")) {
    badRequest("Enter a name and valid email address.")
  }

  const [existingUser] = await findUserByEmail(db, normalizedEmail)

  if (existingUser) {
    const [existingPlatform] = await findPlatformUserForUser(
      db,
      existingUser.id
    )

    if (existingPlatform) {
      conflict("This user already has platform access.")
    }
  }

  const inviteToken = `${existingUser?.id ?? "new"}:${Buffer.from(
    normalizedEmail
  ).toString("base64url")}:${crypto.randomUUID()}`

  const inviteUrl = buildAdminInviteUrl(inviteToken)

  await sendSuperAdminInviteEmail({
    to: normalizedEmail,
    invitedByName: session.user.name,
    inviteUrl,
    recipientEmail: normalizedEmail,
  })
}
