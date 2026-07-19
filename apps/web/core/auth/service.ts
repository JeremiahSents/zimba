import "server-only"

import { cache } from "react"
import { headers } from "next/headers"
import { auth } from "./auth"
import { getOrganizationMembership, type OrganizationMembership } from "../organizations/service"
import { unauthorized, forbidden } from "../shared/errors"

export type SessionWithOrganization = {
  user: typeof auth.$Infer.Session.user
  session: typeof auth.$Infer.Session.session
  organization: OrganizationMembership
}

export type SessionLookupResult =
  | SessionWithOrganization
  | {
      user: typeof auth.$Infer.Session.user
      session: typeof auth.$Infer.Session.session
      organization: null
    }

export const getSessionWithOrganization = cache(async (): Promise<SessionLookupResult | null> => {
  const authSession = await auth.api.getSession({
    headers: await headers(),
  })

  if (!authSession?.session) {
    return null
  }

  const membership = await getOrganizationMembership(authSession.user.id)
  if (!membership) {
    return {
      user: authSession.user,
      session: authSession.session,
      organization: null,
    }
  }

  return {
    user: authSession.user,
    session: authSession.session,
    organization: membership,
  }
})

export async function requireSession(): Promise<SessionWithOrganization> {
  const authSession = await getSessionWithOrganization()

  if (!authSession) {
    unauthorized("Sign in to access this resource.")
  }

  if (!authSession.organization) {
    forbidden("Complete company setup to use Zimba.")
  }

  return authSession
}
