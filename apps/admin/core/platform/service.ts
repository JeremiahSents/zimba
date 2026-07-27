import "server-only"

import { getPlatformStatsUseCase } from "@workspace/api"

export async function getPlatformStats() {
  return getPlatformStatsUseCase()
}
