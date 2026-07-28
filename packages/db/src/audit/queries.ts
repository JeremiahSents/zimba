import { desc, eq } from "drizzle-orm"
import { user } from "../auth/schema"
import { organization } from "../organizations/schema"
import type { DatabaseExecutor } from "../shared/executor"
import { auditLog } from "./schema"

export function listPlatformAuditEvents(
  executor: DatabaseExecutor,
  limit = 100
) {
  return executor
    .select({
      id: auditLog.id,
      action: auditLog.action,
      entityType: auditLog.entityType,
      entityId: auditLog.entityId,
      changes: auditLog.changes,
      createdAt: auditLog.createdAt,
      organizationName: organization.name,
      actorName: user.name,
    })
    .from(auditLog)
    .innerJoin(organization, eq(auditLog.organizationId, organization.id))
    .innerJoin(user, eq(auditLog.actorId, user.id))
    .orderBy(desc(auditLog.createdAt))
    .limit(limit)
}

export function listRecentActivityEvents(
  executor: DatabaseExecutor,
  limit = 10
) {
  return executor
    .select({
      id: auditLog.id,
      action: auditLog.action,
      entityType: auditLog.entityType,
      entityId: auditLog.entityId,
      metadata: auditLog.changes,
      createdAt: auditLog.createdAt,
      organizationName: organization.name,
      actorName: user.name,
    })
    .from(auditLog)
    .innerJoin(organization, eq(auditLog.organizationId, organization.id))
    .leftJoin(user, eq(auditLog.actorId, user.id))
    .where(eq(auditLog.kind, "activity"))
    .orderBy(desc(auditLog.createdAt))
    .limit(limit)
}

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
