import "server-only"
import { and, desc, eq, sql } from "drizzle-orm"
import { db, schema } from "@workspace/db"

export async function createPayable(data: typeof schema.payable.$inferInsert) {
  const [payable] = await db.insert(schema.payable).values(data).returning()
  return payable
}

export async function listProjectPayables(organizationId: string, projectId: string) {
  return db.select().from(schema.payable).where(and(eq(schema.payable.organizationId, organizationId), eq(schema.payable.projectId, projectId))).orderBy(desc(schema.payable.dueDate))
}

export async function updatePayable(organizationId: string, id: string, data: Partial<typeof schema.payable.$inferInsert>) {
  const [payable] = await db
    .update(schema.payable)
    .set(data)
    .where(and(eq(schema.payable.id, id), eq(schema.payable.organizationId, organizationId)))
    .returning()
  return payable
}

export async function deletePayable(organizationId: string, id: string) {
  await db.delete(schema.payable).where(and(eq(schema.payable.id, id), eq(schema.payable.organizationId, organizationId)))
}

export async function createLedgerPayment(data: typeof schema.ledgerPayment.$inferInsert) {
  const [payment] = await db.insert(schema.ledgerPayment).values(data).returning()
  return payment
}

export async function syncExpensePaymentStatus(organizationId: string, expenseId: string) {
  const [totals] = await db.select({ total: sql<number>`coalesce((select sum(${schema.expenseLine.amountCents}) from ${schema.expenseLine} where ${schema.expenseLine.expenseId} = ${expenseId} and ${schema.expenseLine.organizationId} = ${organizationId}), 0)`, paid: sql<number>`coalesce((select sum(${schema.ledgerPayment.amountCents}) from ${schema.ledgerPayment} where ${schema.ledgerPayment.expenseId} = ${expenseId} and ${schema.ledgerPayment.organizationId} = ${organizationId}), 0)` }).from(schema.expense).where(and(eq(schema.expense.id, expenseId), eq(schema.expense.organizationId, organizationId))).limit(1)
  if (!totals) return
  const total = Number(totals.total)
  const paid = Number(totals.paid)
  await db.update(schema.expense).set({ paymentStatus: paid >= total && total > 0 ? "paid" : paid > 0 ? "partial" : "unpaid" }).where(and(eq(schema.expense.id, expenseId), eq(schema.expense.organizationId, organizationId)))
}
