import "server-only"

import { db } from "@workspace/db"
import { platformUser, user } from "@workspace/db/schema"
import { sendSuperAdminInviteEmail } from "@workspace/transactional"
import { eq } from "drizzle-orm"
import { getPlatformSession } from "../auth/service"
import { badRequest, conflict, forbidden } from "../shared/errors"

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
  const session = await getPlatformSession()
  if (session?.platformRole !== "super_admin") {
    forbidden("Only super admins can send Super Admin invitations.")
  }

  const normalizedEmail = input.email.trim().toLowerCase()

  if (!input.name.trim() || !normalizedEmail.includes("@")) {
    badRequest("Enter a name and valid email address.")
  }

  const [existingUser] = await db
    .select()
    .from(user)
    .where(eq(user.email, normalizedEmail))
    .limit(1)

  if (existingUser) {
    const [existingPlatform] = await db
      .select()
      .from(platformUser)
      .where(eq(platformUser.userId, existingUser.id))
      .limit(1)

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
