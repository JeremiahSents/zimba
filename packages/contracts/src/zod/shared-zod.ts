import { z } from "zod"

export const idSchema = z.string().trim().min(1).max(128)
export const boundedNameSchema = z.string().trim().min(1).max(160)
export const boundedTextSchema = z.string().max(2000)
export const emailSchema = z.string().trim().email().max(320)
// Money is stored in cents (bigint columns) and the default currency is UGX,
// where everyday construction amounts run to millions of shillings. The cap is
// a typo guard only: 1e12 cents = 10,000,000,000 UGX. Kept far below
// Number.MAX_SAFE_INTEGER so a 200-line receipt can still be summed in JS.
export const maxMoneyCents = 1_000_000_000_000
export const positiveMoneySchema = z
  .number()
  .finite()
  .positive()
  .max(maxMoneyCents)
export const nonNegativeMoneySchema = z
  .number()
  .finite()
  .nonnegative()
  .max(maxMoneyCents)
export const quantitySchema = z.number().finite().positive().max(1_000_000)
export const currencyCodeSchema = z
  .string()
  .trim()
  .regex(/^[A-Z]{3}$/)
export const dateSchema = z.coerce.date()
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(25),
})
export const searchSchema = z.object({
  search: z.string().trim().max(200).optional(),
  sortBy: z.string().trim().max(80).optional(),
  sortDirection: z.enum(["asc", "desc"]).default("asc"),
})
