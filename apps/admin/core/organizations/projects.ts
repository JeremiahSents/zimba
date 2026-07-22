import "server-only"
import { db } from "@workspace/db"
import { listPlatformProjects as readPlatformProjects } from "@workspace/db/repositories"

export async function listPlatformProjects() {
  return readPlatformProjects(db)
}
