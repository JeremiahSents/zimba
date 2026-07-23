import { desc, eq } from "drizzle-orm"
import { auditLog } from "../schemas/audit-schema"
import type { DatabaseExecutor } from "./types"

export function listAuditEventsForOrganization(
  executor: DatabaseExecutor,
  organizationId: string
) {
  return executor
    .select()
    .from(auditLog)
    .where(eq(auditLog.organizationId, organizationId))
    .orderBy(desc(auditLog.createdAt))
}

export function appendAuditEvent(
  executor: DatabaseExecutor,
  data: typeof auditLog.$inferInsert
) {
  return executor.insert(auditLog).values(data)
}
