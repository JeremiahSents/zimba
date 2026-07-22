import { eq } from "drizzle-orm"
import { organization, organizationMember } from "../schemas/organization-schema"
import type { DatabaseExecutor } from "./types"

export function findOrganizationById(executor: DatabaseExecutor, organizationId: string) {
  return executor.select().from(organization).where(eq(organization.id, organizationId)).limit(1)
}

export function listOrganizationMembers(executor: DatabaseExecutor, organizationId: string) {
  return executor.select().from(organizationMember).where(eq(organizationMember.organizationId, organizationId))
}
