import "server-only"

import {
  isAccountDeactivatedUseCase,
  isPlatformStaffUseCase,
  type WorkspaceContext,
  type WorkspaceRole,
} from "@workspace/api"
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

    // A deactivated account reads as signed out. Deactivation deletes live
    // sessions, so this only catches a cookie already in flight — but it is the
    // difference between "locked out now" and "locked out on next sign-in".
    if (await isAccountDeactivatedUseCase(authSession.user.id)) {
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

export const isPlatformStaff = cache(
  async (userId: string): Promise<boolean> => isPlatformStaffUseCase(userId)
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

/** The signed-in caller as a use case expects them. */
export async function requireWorkspaceContext(): Promise<WorkspaceContext> {
  const { user, organization } = await requireSession()
  return {
    userId: user.id,
    organizationId: organization.organizationId,
    role: organization.role as WorkspaceRole,
    ...(organization.viaGrantId ? { viaGrantId: organization.viaGrantId } : {}),
  }
}
