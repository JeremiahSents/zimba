import "server-only"
import { db } from "@workspace/db"
import { auditLog } from "@workspace/db/schema"
import { desc } from "drizzle-orm"

export async function listPlatformAuditLogs() {
  const logs = await db.query.auditLog.findMany({
    orderBy: [desc(auditLog.createdAt)],
    limit: 100, // Limit for performance on dashboard
  })

  return logs.map(l => ({
    ...l,
    organizationName: "System",
    actorName: l.actorId || "Unknown"
  }))
}
