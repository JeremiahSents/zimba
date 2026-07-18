import "server-only"

import { eq } from "drizzle-orm"
import { db, schema } from "../shared/db"

export type OrganizationMembership = { organizationId: string; organizationName: string; role: string }

export async function getOrganizationMembership(userId: string): Promise<OrganizationMembership | null> {
  const [membership] = await db.select({ organizationId: schema.member.organizationId, organizationName: schema.organization.name, role: schema.member.role }).from(schema.member).innerJoin(schema.organization, eq(schema.organization.id, schema.member.organizationId)).where(eq(schema.member.userId, userId)).limit(1)
  return membership ?? null
}
