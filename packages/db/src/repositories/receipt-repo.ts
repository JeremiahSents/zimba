import { and, desc, eq } from "drizzle-orm"
import { expense, expenseLine } from "../schemas/receipt-schema"
import type { DatabaseExecutor } from "./types"

export function findReceiptForOrganization(executor: DatabaseExecutor, organizationId: string, receiptId: string) {
  return executor.select().from(expense).where(and(eq(expense.id, receiptId), eq(expense.organizationId, organizationId))).limit(1)
}

export function listReceiptsForProject(executor: DatabaseExecutor, organizationId: string, projectId: string) {
  return executor.select().from(expense).where(and(eq(expense.organizationId, organizationId), eq(expense.projectId, projectId))).orderBy(desc(expense.createdAt))
}

export function listReceiptLines(executor: DatabaseExecutor, organizationId: string, receiptId: string) {
  return executor.select().from(expenseLine).where(and(eq(expenseLine.organizationId, organizationId), eq(expenseLine.expenseId, receiptId))).orderBy(desc(expenseLine.createdAt))
}

export function deleteReceiptForOrganization(executor: DatabaseExecutor, organizationId: string, receiptId: string) {
  return executor.delete(expense).where(and(eq(expense.id, receiptId), eq(expense.organizationId, organizationId)))
}
