import "server-only"
import { and, desc, eq } from "drizzle-orm"
import { db, schema } from "../shared/db"

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
