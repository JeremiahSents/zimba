import "server-only"
import { db } from "@workspace/db"
import { listPlatformAuditEvents } from "@workspace/db/repositories"

export async function listPlatformAuditLogs() {
  const rows = await listPlatformAuditEvents(db)

  return rows.map((l) => ({
    ...l,
    actorName: l.actorName ?? "Unknown",
  }))
}
