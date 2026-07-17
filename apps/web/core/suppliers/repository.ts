import "server-only"
import { eq, and, desc, sql } from "drizzle-orm"
import { db, schema } from "../shared/db"

export async function listSuppliers(organizationId: string) {
  return await db
    .select()
    .from(schema.supplier)
    .where(eq(schema.supplier.organizationId, organizationId))
    .orderBy(desc(schema.supplier.createdAt))
}

export async function createSupplier(data: typeof schema.supplier.$inferInsert) {
  const [supplier] = await db.insert(schema.supplier).values(data).returning()
  return supplier
}
