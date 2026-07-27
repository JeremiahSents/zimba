import { z } from "zod"
import { emailSchema, idSchema } from "./schemas"
export const workspaceRoleSchema = z.enum([
  "owner",
  "site_manager",
  "accountant",
  "viewer",
])
export const authCredentialsSchema = z.object({
  email: emailSchema,
  password: z.string().min(8).max(128),
})
export const userIdSchema = z.object({ userId: idSchema })
