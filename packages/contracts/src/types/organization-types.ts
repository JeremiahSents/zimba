import type { z } from "zod"
import type { organizationStatusSchema, workspaceRoleSchema } from "../zod"
export type OrganizationStatus = z.infer<typeof organizationStatusSchema>
export type OrganizationDto = {
  id: string
  name: string
  slug: string
  status: OrganizationStatus
  baseCurrency: string
}
export type MembershipDto = {
  id: string
  organizationId: string
  userId: string
  role: z.infer<typeof workspaceRoleSchema>
}
