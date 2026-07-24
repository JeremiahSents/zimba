import "server-only"
import { listPlatformAuditLogsUseCase } from "@workspace/api"
import { db } from "@workspace/db"

export async function listPlatformAuditLogs() {
  return listPlatformAuditLogsUseCase({ executor: db })
}
