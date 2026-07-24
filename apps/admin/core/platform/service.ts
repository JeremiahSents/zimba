import "server-only"

import { getPlatformStatsUseCase } from "@workspace/api"
import { apiExecutor } from "@workspace/api-runtime"

export async function getPlatformStats() {
  return getPlatformStatsUseCase(apiExecutor)
}
