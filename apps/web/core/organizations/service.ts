import "server-only"

import { getOrganizationMembershipUseCase } from "@workspace/api"

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
  return getOrganizationMembershipUseCase(userId, workspaceSlug)
}
