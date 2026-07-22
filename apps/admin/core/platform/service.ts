import "server-only"

import { db } from "@workspace/db"
import { readPlatformStats } from "@workspace/db/repositories"

export async function getPlatformStats() {
  const stats = await readPlatformStats(db)

  return {
    ...stats,
    organizationsNeedingAttention:
      stats.suspendedOrganizations + stats.trialOrganizations,
  }
}
