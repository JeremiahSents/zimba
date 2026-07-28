import { db } from "@workspace/db"

import {
  findUserOrganizationMembership,
  findUserOrganizationMembershipBySlug,
} from "@workspace/db/organizations"
import { findActiveGrantForUser } from "@workspace/db/platform"

export async function getOrganizationMembershipUseCase(
  userId: string,
  workspaceSlug?: string | null
) {
  const [membership] = workspaceSlug
    ? await findUserOrganizationMembershipBySlug(db, userId, workspaceSlug)
    : await findUserOrganizationMembership(db, userId)

  // A real membership always wins over a platform grant.
  if (membership) return membership

  const [grant] = await findActiveGrantForUser(db, userId)
  if (!grant) return null

  // The grant only answers for the workspace it was issued against. Without
  // this, a grant on one tenant resolves while browsing another, and writes
  // land in the wrong organization.
  if (workspaceSlug && grant.slug !== workspaceSlug) return null

  return {
    organizationId: grant.organizationId,
    organizationName: grant.organizationName,
    slug: grant.slug,
    role: grant.role,
    viaGrantId: grant.id,
    grantExpiresAt: grant.expiresAt,
  }
}
