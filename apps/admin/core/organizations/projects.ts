import "server-only"
import { listPlatformProjectsUseCase } from "@workspace/api"

export async function listPlatformProjects() {
  return listPlatformProjectsUseCase()
}
