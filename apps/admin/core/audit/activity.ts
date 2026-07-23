import "server-only"
import { db } from "@workspace/db"
import { listRecentActivityEvents } from "@workspace/db/repositories"

export async function getRecentActivity(limit = 10) {
  const rows = await listRecentActivityEvents(db, limit)

  return rows.map((r) => ({
    ...r,
    actorName: r.actorName ?? "System",
  }))
}

export async function listPlatformActivityEvents() {
  return getRecentActivity(100)
}
