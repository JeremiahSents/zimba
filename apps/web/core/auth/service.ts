import "server-only"

import { headers } from "next/headers"
import { auth } from "./auth"
import { getOrganizationMembership, type OrganizationMembership } from "../organizations/service"
import { unauthorized, forbidden } from "../shared/errors"

export type SessionWithOrganization = {
  user: typeof auth.$Infer.Session.user
  session: typeof auth.$Infer.Session.session
  organization: OrganizationMembership
}

export async function requireSession(): Promise<SessionWithOrganization> {
  const authSession = await auth.api.getSession({
    headers: await headers(),
  })

  if (!authSession?.session) {
    unauthorized("Sign in to access this resource.")
  }

  const membership = await getOrganizationMembership(authSession.user.id)
  if (!membership) {
    forbidden("Complete company setup to use Zimba.")
  }

  return {
    user: authSession.user,
    session: authSession.session,
    organization: membership,
  }
}
