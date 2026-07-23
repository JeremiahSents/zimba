import "server-only"

import { headers } from "next/headers"
import { cache } from "react"
import {
  getOrganizationMembership,
  type OrganizationMembership,
} from "../organizations/service"
import { forbidden, unauthorized } from "../shared/errors"
import { auth } from "./auth"

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

export const getSessionWithOrganization = cache(
  async (): Promise<SessionLookupResult | null> => {
    const requestHeaders = await headers()
    const authSession = await auth.api.getSession({ headers: requestHeaders })

    if (!authSession?.session) {
      return null
    }

    const membership = await getOrganizationMembership(
      authSession.user.id,
      requestHeaders.get("x-workspace-slug")
    )
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
  }
)

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
