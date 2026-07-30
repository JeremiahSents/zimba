import { z } from "zod"
import { emailSchema, idSchema } from "../shared/schemas"
export const platformRoleSchema = z.enum(["super_admin", "support", "none"])
export const adminInviteSchema = z.object({
  email: emailSchema,
  name: z.string().trim().min(1).max(120),
})
export const platformRoleUpdateSchema = z.object({
  userId: idSchema,
  role: platformRoleSchema,
})
export const accountDeactivationSchema = z.object({
  userId: idSchema,
  reason: z.string().trim().max(2000).optional().or(z.literal("")),
})
/**
 * `confirmEmail` is the deliberate friction on an irreversible action: the
 * admin retypes the address, and the use case rejects any mismatch.
 */
export const accountDeletionSchema = z.object({
  userId: idSchema,
  confirmEmail: emailSchema,
})
