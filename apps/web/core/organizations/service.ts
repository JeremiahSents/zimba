import "server-only"

import { getOrganizationMembershipUseCase } from "@workspace/api"
import { db } from "@workspace/db"

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
  return getOrganizationMembershipUseCase(
    { executor: db },
    userId,
    workspaceSlug
  )
}
