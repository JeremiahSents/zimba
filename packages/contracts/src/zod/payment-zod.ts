import { z } from "zod"
import {
  currencyCodeSchema,
  dateSchema,
  idSchema,
  positiveMoneySchema,
} from "./shared-zod"
export const paymentMethodSchema = z.enum([
  "cash",
  "bank",
  "mobile_money",
  "card",
  "other",
])
export const paymentInputSchema = z.object({
  organizationId: idSchema,
  expenseId: idSchema.optional(),
  payableId: idSchema.optional(),
  supplierId: idSchema.optional(),
  amountCents: positiveMoneySchema,
  currency: currencyCodeSchema.default("UGX"),
  paymentDate: dateSchema.optional(),
  method: paymentMethodSchema.optional(),
  reference: z.string().max(160).optional(),
})
