import "server-only"
import { eq, and, sql } from "drizzle-orm"
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
  if (allocation) {
    // `expense_line.allocation_id` still exists on databases upgraded from the
    // old schema. Keep its lookup table in sync until the legacy column is
    // removed in a later, explicitly scheduled migration.
    await db.execute(sql`
      INSERT INTO "allocation" ("id", "organization_id", "project_id", "name", "budget_cents", "created_at", "updated_at")
      VALUES (${allocation.id}, ${allocation.organizationId}, ${allocation.projectId}, ${allocation.name}, ${allocation.budgetCents}, ${allocation.createdAt}, ${allocation.updatedAt})
      ON CONFLICT ("id") DO UPDATE
      SET "name" = EXCLUDED."name", "budget_cents" = EXCLUDED."budget_cents", "updated_at" = EXCLUDED."updated_at"
    `)
  }
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
  if (allocation) {
    await db.execute(sql`
      UPDATE "allocation"
      SET "name" = ${allocation.name}, "budget_cents" = ${allocation.budgetCents}, "updated_at" = ${allocation.updatedAt}
      WHERE "id" = ${allocation.id} AND "organization_id" = ${organizationId}
    `)
  }
  return allocation
}
