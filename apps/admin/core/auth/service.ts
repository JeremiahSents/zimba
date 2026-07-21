import "server-only"

import { cache } from "react"
import { headers } from "next/headers"
import { auth } from "./auth"
import { unauthorized, forbidden } from "../shared/errors"
import { db } from "@workspace/db"
import { platformUser } from "@workspace/db/schema"
import { eq } from "drizzle-orm"

export type PlatformSession = {
  user: typeof auth.$Infer.Session.user
  session: typeof auth.$Infer.Session.session
  platformRole: string
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
      platformRole: "none",
    }
  }

  return {
    user: authSession.user,
    session: authSession.session,
    platformRole: pUser.role,
  }
})

export async function requirePlatformSession(): Promise<PlatformSession> {
  const session = await getPlatformSession()

  if (!session || !session.user) {
    unauthorized("Sign in to access this resource.")
  }

  if (session.platformRole !== "super_admin" && session.platformRole !== "support") {
    forbidden("You do not have permission to access the Super Admin Dashboard.")
  }

  return session
}
