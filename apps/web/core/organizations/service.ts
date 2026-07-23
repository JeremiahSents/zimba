import "server-only"

import { db } from "@workspace/db"
import { findUserOrganizationMembership } from "@workspace/db/repositories"

export type OrganizationMembership = {
  organizationId: string
  organizationName: string
  role: string
}

export async function getOrganizationMembership(
  userId: string
): Promise<OrganizationMembership | null> {
  const [membership] = await findUserOrganizationMembership(db, userId)
  return membership ?? null
}
