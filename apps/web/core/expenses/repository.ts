import "server-only"

import { and, desc, eq } from "drizzle-orm"
import { db, schema } from "../shared/db"

export async function listExpenses(organizationId: string) {
  return db
    .select({
      expense: schema.expense,
      projectName: schema.project.name,
      supplierName: schema.supplier.name,
    })
    .from(schema.expense)
    .leftJoin(schema.project, eq(schema.project.id, schema.expense.projectId))
    .leftJoin(schema.supplier, eq(schema.supplier.id, schema.expense.supplierId))
    .where(eq(schema.expense.organizationId, organizationId))
    .orderBy(desc(schema.expense.createdAt))
}

export async function getExpense(organizationId: string, expenseId: string) {
  const [row] = await db
    .select({ expense: schema.expense, projectName: schema.project.name, supplierName: schema.supplier.name })
    .from(schema.expense)
    .leftJoin(schema.project, eq(schema.project.id, schema.expense.projectId))
    .leftJoin(schema.supplier, eq(schema.supplier.id, schema.expense.supplierId))
    .where(and(eq(schema.expense.id, expenseId), eq(schema.expense.organizationId, organizationId)))
    .limit(1)
  if (!row) return null
  const lines = await db
    .select({ line: schema.expenseLine, allocationName: schema.allocation.name })
    .from(schema.expenseLine)
    .leftJoin(schema.allocation, eq(schema.allocation.id, schema.expenseLine.allocationId))
    .where(and(eq(schema.expenseLine.expenseId, expenseId), eq(schema.expenseLine.organizationId, organizationId)))
  const payments = await db.select().from(schema.ledgerPayment).where(and(eq(schema.ledgerPayment.expenseId, expenseId), eq(schema.ledgerPayment.organizationId, organizationId)))
  return { ...row, lines, payments }
}

export async function getExpenseLines(organizationId: string, expenseId: string) {
  return db
    .select({ line: schema.expenseLine, allocationName: schema.allocation.name })
    .from(schema.expenseLine)
    .leftJoin(schema.allocation, eq(schema.allocation.id, schema.expenseLine.allocationId))
    .where(and(eq(schema.expenseLine.expenseId, expenseId), eq(schema.expenseLine.organizationId, organizationId)))
}

export async function updateExpense(organizationId: string, id: string, data: Partial<typeof schema.expense.$inferInsert>) {
  const [expense] = await db.update(schema.expense).set({ ...data, updatedAt: new Date() }).where(and(eq(schema.expense.id, id), eq(schema.expense.organizationId, organizationId))).returning()
  return expense
}
