import type { DatabaseExecutor } from "@workspace/db/repositories"
import {
  appendPlatformAudit,
  listPlatformAuditEvents,
  listRecentActivityEvents,
} from "@workspace/db/repositories"

export async function listPlatformAuditLogsUseCase(deps: {
  executor: DatabaseExecutor
}) {
  const rows = await listPlatformAuditEvents(deps.executor)

  return rows.map((row) => ({
    ...row,
    actorName: row.actorName ?? "Unknown",
  }))
}

export async function listRecentActivityUseCase(
  deps: { executor: DatabaseExecutor },
  limit = 10
) {
  const rows = await listRecentActivityEvents(deps.executor, limit)

  return rows.map((row) => ({
    ...row,
    actorName: row.actorName ?? "System",
  }))
}

export function listPlatformActivityEventsUseCase(deps: {
  executor: DatabaseExecutor
}) {
  return listRecentActivityUseCase(deps, 100)
}

export async function recordPlatformAuditUseCase(
  deps: { executor: DatabaseExecutor },
  input: {
    actorId: string
    targetUserId?: string | null
    operation: string
    metadata?: Record<string, unknown>
  }
) {
  await appendPlatformAudit(deps.executor, {
    actorId: input.actorId,
    targetUserId: input.targetUserId ?? null,
    operation: input.operation,
    metadata: input.metadata ?? null,
  })
}
