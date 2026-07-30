import { db } from "@workspace/db"
import { findActiveUserMemberships } from "@workspace/db/organizations"
import { listActiveGrantsForUser } from "@workspace/db/platform"

export type UserWorkspace = {
  organizationId: string
  organizationName: string
  slug: string
  role: string
  /** True when access comes from a platform staff grant, not a membership. */
  viaGrant: boolean
  /** Only set for grant-based access. */
  grantExpiresAt?: Date
}

export type UserWorkspaceList = {
  workspaces: UserWorkspace[]
  /** Whether to offer "New workspace" — owners only, checked server-side too. */
  canCreateWorkspace: boolean
}

/**
 * Every workspace the switcher should show: real memberships first, then any
 * active platform staff grants.
 *
 * A membership always wins over a grant for the same organization, matching
 * `resolveWorkspace` — otherwise a staff member who is also a real member
 * would see their own workspace listed twice with different roles.
 */
export async function listUserWorkspacesUseCase(
  userId: string
): Promise<UserWorkspaceList> {
  const [memberships, grants] = await Promise.all([
    findActiveUserMemberships(db, userId),
    listActiveGrantsForUser(db, userId),
  ])

  // Derived from the rows already in hand rather than a third round trip —
  // this runs on every workspace navigation. createWorkspaceUseCase still
  // asks the database directly, because that is the check that enforces it.
  const canCreateWorkspace = memberships.some((row) => row.role === "owner")

  const seen = new Set(memberships.map((row) => row.organizationId))

  const workspaces: UserWorkspace[] = memberships.map((row) => ({
    organizationId: row.organizationId,
    organizationName: row.organizationName,
    slug: row.slug,
    role: row.role,
    viaGrant: false,
  }))

  for (const grant of grants) {
    if (seen.has(grant.organizationId)) continue
    seen.add(grant.organizationId)
    workspaces.push({
      organizationId: grant.organizationId,
      organizationName: grant.organizationName,
      slug: grant.slug,
      role: grant.role,
      viaGrant: true,
      grantExpiresAt: grant.expiresAt,
    })
  }

  return { workspaces, canCreateWorkspace }
}
