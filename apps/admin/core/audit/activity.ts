import "server-only"
import {
  listPlatformActivityEventsUseCase,
  listRecentActivityUseCase,
} from "@workspace/api"
import { apiExecutor } from "@workspace/api-runtime"

export async function getRecentActivity(limit = 10) {
  return listRecentActivityUseCase(apiExecutor, limit)
}

export async function listPlatformActivityEvents() {
  return listPlatformActivityEventsUseCase(apiExecutor)
}
