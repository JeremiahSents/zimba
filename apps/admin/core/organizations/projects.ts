import "server-only"
import { listPlatformProjectsUseCase } from "@workspace/api"
import { db } from "@workspace/db"

export async function listPlatformProjects() {
  return listPlatformProjectsUseCase({ executor: db })
}
