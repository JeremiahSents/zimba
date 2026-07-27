import "server-only"
import {
  listPlatformActivityEventsUseCase,
  listRecentActivityUseCase,
} from "@workspace/api"

export async function getRecentActivity(limit = 10) {
  return listRecentActivityUseCase(limit)
}

export async function listPlatformActivityEvents() {
  return listPlatformActivityEventsUseCase()
}
