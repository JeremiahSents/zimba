import { z } from "zod"
import { emailSchema, idSchema } from "./shared-zod"
export const platformRoleSchema = z.enum(["super_admin", "support", "none"])
export const adminInviteSchema = z.object({
  email: emailSchema,
  name: z.string().trim().min(1).max(120),
})
export const platformRoleUpdateSchema = z.object({
  userId: idSchema,
  role: platformRoleSchema,
})
