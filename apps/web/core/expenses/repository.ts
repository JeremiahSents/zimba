import "server-only"
import { eq, and, desc, sql } from "drizzle-orm"
import { db, schema } from "../shared/db"

export async function createExpense(data: typeof schema.expense.$inferInsert) {
  const [expense] = await db.insert(schema.expense).values(data).returning()
  return expense
}

export async function createExpenseLine(data: typeof schema.expenseLine.$inferInsert) {
  const [line] = await db.insert(schema.expenseLine).values(data).returning()
  return line
}

export async function updateExpense(id: string, data: Partial<typeof schema.expense.$inferInsert>) {
  const [expense] = await db
    .update(schema.expense)
    .set(data)
    .where(eq(schema.expense.id, id))
    .returning()
  return expense
}
