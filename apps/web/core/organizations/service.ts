import "server-only"

import { db } from "@workspace/db"
import {
  findUserOrganizationMembership,
  findUserOrganizationMembershipBySlug,
} from "@workspace/db/repositories"

export type OrganizationMembership = {
  organizationId: string
  organizationName: string
  slug: string
  role: string
}

export async function getOrganizationMembership(
  userId: string,
  workspaceSlug?: string | null
): Promise<OrganizationMembership | null> {
  const [membership] = workspaceSlug
    ? await findUserOrganizationMembershipBySlug(db, userId, workspaceSlug)
    : await findUserOrganizationMembership(db, userId)
  return membership ?? null
}
