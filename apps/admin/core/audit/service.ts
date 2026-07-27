import "server-only"
import { listPlatformAuditLogsUseCase } from "@workspace/api"

export async function listPlatformAuditLogs() {
  return listPlatformAuditLogsUseCase()
}
