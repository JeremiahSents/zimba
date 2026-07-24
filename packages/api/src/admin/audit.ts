import type { DatabaseExecutor } from "@workspace/db/repositories"
import {
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
