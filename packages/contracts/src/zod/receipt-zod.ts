import { z } from "zod"
import {
  boundedTextSchema,
  currencyCodeSchema,
  dateSchema,
  idSchema,
  nonNegativeMoneySchema,
  quantitySchema,
} from "./shared-zod"
export const expenseStatusSchema = z.enum([
  "draft",
  "submitted",
  "approved",
  "rejected",
  "paid",
])
export const receiptLineSchema = z.object({
  allocationId: idSchema,
  itemDescription: boundedTextSchema.min(1),
  quantity: quantitySchema,
  unitRateCents: nonNegativeMoneySchema,
  amountCents: nonNegativeMoneySchema,
})
export const receiptInputSchema = z.object({
  organizationId: idSchema,
  projectId: idSchema.optional(),
  supplierId: idSchema.optional(),
  expenseDate: dateSchema.optional(),
  currency: currencyCodeSchema.default("UGX"),
  lines: z.array(receiptLineSchema).min(1).max(200),
})
export const expenseLinkSchema = z.object({
  project_id: idSchema,
  supplier_id: idSchema,
})
export const receiptStatusInputSchema = z.object({
  projectId: idSchema,
  expenseId: idSchema,
  status: expenseStatusSchema,
})
