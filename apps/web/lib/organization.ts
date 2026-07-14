import "server-only"

import { eq } from "drizzle-orm"
import { db } from "@/lib/database"
import { member, organization } from "@/lib/organization-schema"

export type OrganizationMembership = {
  organizationId: string
  organizationName: string
  role: string
}

export async function getOrganizationMembership(
  userId: string
): Promise<OrganizationMembership | null> {
  const [membership] = await db
    .select({
      organizationId: member.organizationId,
      organizationName: organization.name,
      role: member.role,
    })
    .from(member)
    .innerJoin(organization, eq(organization.id, member.organizationId))
    .where(eq(member.userId, userId))
    .limit(1)

  return membership ?? null
}
