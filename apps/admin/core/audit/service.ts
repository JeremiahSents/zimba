import "server-only"
import { listPlatformAuditLogsUseCase } from "@workspace/api"
import { apiExecutor } from "@workspace/api-runtime"

export async function listPlatformAuditLogs() {
  return listPlatformAuditLogsUseCase(apiExecutor)
}
