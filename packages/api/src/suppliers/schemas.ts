import { z } from "zod"
import { boundedNameSchema, emailSchema, idSchema } from "../shared/schemas"
export const supplierStatusSchema = z.enum(["active", "inactive"])
export const supplierInputSchema = z.object({
  organizationId: idSchema,
  name: boundedNameSchema,
  category: boundedNameSchema.max(80),
  companyContact: z.string().max(160).nullish(),
  contactName: z.string().max(160).nullish(),
  phone: z.string().max(80).nullish(),
  email: emailSchema.nullish().or(z.literal("")),
  notes: z.string().max(2000).nullish(),
  status: supplierStatusSchema.optional(),
})
export const supplierFormSchema = supplierInputSchema.omit({
  organizationId: true,
})
