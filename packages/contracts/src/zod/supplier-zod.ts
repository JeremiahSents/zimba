import { z } from "zod"
import { boundedNameSchema, emailSchema, idSchema } from "./shared-zod"
export const supplierStatusSchema = z.enum(["active", "inactive"])
export const supplierInputSchema = z.object({ organizationId: idSchema, name: boundedNameSchema, category: boundedNameSchema.max(80), companyContact: z.string().max(160).optional(), contactName: z.string().max(160).optional(), phone: z.string().max(80).optional(), email: emailSchema.optional().or(z.literal("")), notes: z.string().max(2000).optional(), status: supplierStatusSchema.optional() })
export const supplierFormSchema = supplierInputSchema.omit({ organizationId: true })
