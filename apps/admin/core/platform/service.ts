import "server-only"

import { getPlatformStatsUseCase } from "@workspace/api"
import { db } from "@workspace/db"

export async function getPlatformStats() {
  return getPlatformStatsUseCase({ executor: db })
}
