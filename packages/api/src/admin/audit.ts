import { db } from "@workspace/db"

import { listPlatformAuditEvents, listRecentActivityEvents } from "@workspace/db/audit"
import { appendPlatformAudit } from "@workspace/db/platform"

export async function listPlatformAuditLogsUseCase() {
  const rows = await listPlatformAuditEvents(db)

  return rows.map((row) => ({
    ...row,
    actorName: row.actorName ?? "Unknown",
  }))
}

export async function listRecentActivityUseCase(limit = 10) {
  const rows = await listRecentActivityEvents(db, limit)

  return rows.map((row) => ({
    ...row,
    actorName: row.actorName ?? "System",
  }))
}

export function listPlatformActivityEventsUseCase() {
  return listRecentActivityUseCase(100)
}

export async function recordPlatformAuditUseCase(input: {
  actorId: string
  targetUserId?: string | null
  operation: string
  metadata?: Record<string, unknown>
}) {
  await appendPlatformAudit(db, {
    actorId: input.actorId,
    targetUserId: input.targetUserId ?? null,
    operation: input.operation,
    metadata: input.metadata ?? null,
  })
}
