import "server-only"
import { eq, and } from "drizzle-orm"
import { db, schema } from "@workspace/db"

export async function listAllocations(organizationId: string, projectId: string) {
  return await db
    .select()
    .from(schema.allocation)
    .where(
      and(
        eq(schema.allocation.projectId, projectId),
        eq(schema.allocation.organizationId, organizationId)
      )
    )
}

export async function createAllocation(data: typeof schema.allocation.$inferInsert) {
  const [allocation] = await db.insert(schema.allocation).values(data).returning()
  return allocation
}

export async function updateAllocation(organizationId: string, projectId: string, allocationId: string, data: Partial<typeof schema.allocation.$inferInsert>) {
  const [allocation] = await db
    .update(schema.allocation)
    .set({ ...data, updatedAt: new Date() })
    .where(
      and(
        eq(schema.allocation.id, allocationId),
        eq(schema.allocation.projectId, projectId),
        eq(schema.allocation.organizationId, organizationId)
      )
    )
    .returning()
  return allocation
}
