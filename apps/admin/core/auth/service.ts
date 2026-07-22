import "server-only"

import { cache } from "react"
import { headers } from "next/headers"
import { auth } from "./auth"
import { unauthorized, forbidden } from "../shared/errors"
import { db } from "@workspace/db"
import { platformUser } from "@workspace/db/schema"
import { eq } from "drizzle-orm"
import type { PlatformAccess, PlatformRole } from "./roles"
export { platformRoles } from "./roles"
export type { PlatformAccess, PlatformRole } from "./roles"

export type PlatformSession = {
  user: typeof auth.$Infer.Session.user
  session: typeof auth.$Infer.Session.session
  platformRole: PlatformAccess
}

export const getPlatformSession = cache(async (): Promise<PlatformSession | null> => {
  const authSession = await auth.api.getSession({
    headers: await headers(),
  })

  if (!authSession?.session) {
    return null
  }

  // Check if the user is a platform user
  const pUser = await db.query.platformUser.findFirst({
    where: eq(platformUser.userId, authSession.user.id),
  })

  if (!pUser) {
    return {
      user: authSession.user,
      session: authSession.session,
      platformRole: null,
    }
  }

  return {
    user: authSession.user,
    session: authSession.session,
    platformRole: pUser.role === "super_admin" || pUser.role === "support" ? pUser.role : null,
  }
})

export async function requirePlatformSession(): Promise<PlatformSession> {
  const session = await getPlatformSession()

  if (!session?.user) {
    unauthorized("Sign in to access this resource.")
  }

  if (session.platformRole !== "super_admin" && session.platformRole !== "support") {
    forbidden("You do not have permission to access the Super Admin Dashboard.")
  }

  return session
}

export async function requirePlatformRole(
  allowed: readonly PlatformRole[]
): Promise<PlatformSession> {
  const session = await requirePlatformSession()
  if (!session.platformRole || !allowed.includes(session.platformRole)) {
    forbidden("You do not have permission to perform this action.")
  }
  return session
}
