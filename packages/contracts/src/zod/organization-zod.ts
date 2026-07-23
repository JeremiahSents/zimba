import { z } from "zod"
import { workspaceRoleSchema } from "./auth-zod"
import { boundedNameSchema, emailSchema, idSchema } from "./shared-zod"
export const organizationStatusSchema = z.enum(["active", "trial", "suspended"])
export const organizationIdSchema = z.object({ organizationId: idSchema })
export const organizationInviteSchema = z.object({
  email: emailSchema,
  name: boundedNameSchema.max(120),
  role: z.enum(["site_manager", "accountant", "viewer"]),
})
export const organizationStatusInputSchema = z.object({
  organizationId: idSchema,
  status: organizationStatusSchema,
})
export const teamInviteSchema = z.object({
  email: emailSchema,
  role: workspaceRoleSchema,
})
