import "server-only"
import { listPlatformProjectsUseCase } from "@workspace/api"
import { apiExecutor } from "@workspace/api-runtime"

export async function listPlatformProjects() {
  return listPlatformProjectsUseCase(apiExecutor)
}
