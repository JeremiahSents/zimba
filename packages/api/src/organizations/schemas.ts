import { z } from "zod"
import { workspaceRoleSchema } from "../shared/auth-schemas"
import { boundedNameSchema, emailSchema, idSchema } from "../shared/schemas"
export const organizationStatusSchema = z.enum([
  "active",
  "trial",
  "suspended",
  "pending_approval",
])
export const organizationIdSchema = z.object({ organizationId: idSchema })
export const createWorkspaceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Workspace name must be at least 2 characters.")
    .max(120, "Workspace name must be 120 characters or fewer."),
})
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
