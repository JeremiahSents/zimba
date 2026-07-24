import "server-only"
import {
  listPlatformActivityEventsUseCase,
  listRecentActivityUseCase,
} from "@workspace/api"
import { db } from "@workspace/db"

export async function getRecentActivity(limit = 10) {
  return listRecentActivityUseCase({ executor: db }, limit)
}

export async function listPlatformActivityEvents() {
  return listPlatformActivityEventsUseCase({ executor: db })
}
