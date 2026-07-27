import { db } from "@workspace/db"

import { findUserOrganizationMembership, findUserOrganizationMembershipBySlug } from "@workspace/db/organizations"

export async function getOrganizationMembershipUseCase(
  userId: string,
  workspaceSlug?: string | null
) {
  const [membership] = workspaceSlug
    ? await findUserOrganizationMembershipBySlug(db, userId, workspaceSlug)
    : await findUserOrganizationMembership(db, userId)
  return membership ?? null
}
