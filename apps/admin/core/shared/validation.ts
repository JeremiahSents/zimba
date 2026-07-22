import { z } from "zod"

export const idSchema = z.string().trim().min(1).max(128)
export const platformRoleSchema = z.enum(["super_admin", "support", "none"])
export const organizationStatusSchema = z.enum(["active", "trial", "suspended"])
export const adminInviteSchema = z.object({
  email: z.string().trim().email().max(320),
  name: z.string().trim().min(1).max(120),
})
