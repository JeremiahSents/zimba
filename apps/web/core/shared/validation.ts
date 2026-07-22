import { z } from "zod"

export const idSchema = z.string().trim().min(1).max(128)
export const boundedNameSchema = z.string().trim().min(1).max(160)
export const boundedTextSchema = z.string().max(2000)
export const emailSchema = z.string().trim().email().max(320)
export const positiveMoneySchema = z.number().finite().positive().max(1_000_000_000)
export const nonNegativeMoneySchema = z.number().finite().nonnegative().max(1_000_000_000)
export const workspaceRoleSchema = z.enum(["owner", "site_manager", "accountant", "viewer"])
export const expenseStatusSchema = z.enum(["draft", "submitted", "approved", "rejected", "paid"])
