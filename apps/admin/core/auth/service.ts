import "server-only"

import { db } from "@workspace/db"
import { findPlatformUserForUser } from "@workspace/db/repositories"
import { headers } from "next/headers"
import { cache } from "react"
import { forbidden, unauthorized } from "../shared/errors"
import { auth } from "./auth"
import type { PlatformAccess, PlatformRole } from "./roles"

export type { PlatformAccess, PlatformRole } from "./roles"
export { platformRoles } from "./roles"

export type PlatformSession = {
  user: typeof auth.$Infer.Session.user
  session: typeof auth.$Infer.Session.session
  platformRole: PlatformAccess
}

export const getPlatformSession = cache(
  async (): Promise<PlatformSession | null> => {
    const authSession = await auth.api.getSession({
      headers: await headers(),
    })

    if (!authSession?.session) {
      return null
    }

    const [platformUser] = await findPlatformUserForUser(
      db,
      authSession.user.id
    )

    if (!platformUser) {
      return {
        user: authSession.user,
        session: authSession.session,
        platformRole: null,
      }
    }

    return {
      user: authSession.user,
      session: authSession.session,
      platformRole:
        platformUser.role === "super_admin" || platformUser.role === "support"
          ? platformUser.role
          : null,
    }
  }
)

export async function requirePlatformSession(): Promise<PlatformSession> {
  const session = await getPlatformSession()

  if (!session?.user) {
    unauthorized("Sign in to access this resource.")
  }

  if (
    session.platformRole !== "super_admin" &&
    session.platformRole !== "support"
  ) {
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
