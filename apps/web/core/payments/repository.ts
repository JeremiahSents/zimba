import "server-only"
import { eq, and } from "drizzle-orm"
import { db, schema } from "../shared/db"

export async function createPayable(data: typeof schema.payable.$inferInsert) {
  const [payable] = await db.insert(schema.payable).values(data).returning()
  return payable
}

export async function updatePayable(id: string, data: Partial<typeof schema.payable.$inferInsert>) {
  const [payable] = await db
    .update(schema.payable)
    .set(data)
    .where(eq(schema.payable.id, id))
    .returning()
  return payable
}

export async function deletePayable(id: string) {
  await db.delete(schema.payable).where(eq(schema.payable.id, id))
}

export async function createLedgerPayment(data: typeof schema.ledgerPayment.$inferInsert) {
  const [payment] = await db.insert(schema.ledgerPayment).values(data).returning()
  return payment
}
