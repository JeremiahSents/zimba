import "server-only"

import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getOrganizationMembership } from "@/lib/organization"

export type ZimbaApiSession = {
  token: string
  organizationId: string
}

export async function getZimbaApiSession(): Promise<ZimbaApiSession | null> {
  const authSession = await auth.api.getSession({
    headers: await headers(),
  })

  if (!authSession?.session.token) {
    return null
  }

  const membership = await getOrganizationMembership(authSession.user.id)
  if (!membership) return null

  return {
    token: authSession.session.token,
    organizationId: membership.organizationId,
  }
}

export async function requireZimbaApiSession(): Promise<ZimbaApiSession> {
  const session = await getZimbaApiSession()
  if (!session) {
    throw new Error("Sign in and complete company setup to use the Zimba API.")
  }
  return session
}
