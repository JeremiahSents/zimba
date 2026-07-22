import "server-only"
import { db } from "@workspace/db"
import { auditLog, organization, user } from "@workspace/db/schema"
import { desc, eq } from "drizzle-orm"

export async function listPlatformAuditLogs() {
  const rows = await db
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
    .limit(100)

  return rows.map((l) => ({
    ...l,
    actorName: l.actorName ?? "Unknown",
  }))
}
