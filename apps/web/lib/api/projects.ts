import "server-only"
import { mockProjectDetails } from "@/lib/api/mock-data"
import type { ProjectDetailResponse } from "@/lib/types"

export async function getProjectDetail(id: number): Promise<ProjectDetailResponse | undefined> {
  return mockProjectDetails.find((project) => project.id === id)
}
