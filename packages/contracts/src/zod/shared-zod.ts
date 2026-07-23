import { z } from "zod"

export const idSchema = z.string().trim().min(1).max(128)
export const boundedNameSchema = z.string().trim().min(1).max(160)
export const boundedTextSchema = z.string().max(2000)
export const emailSchema = z.string().trim().email().max(320)
export const positiveMoneySchema = z
  .number()
  .finite()
  .positive()
  .max(1_000_000_000)
export const nonNegativeMoneySchema = z
  .number()
  .finite()
  .nonnegative()
  .max(1_000_000_000)
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
