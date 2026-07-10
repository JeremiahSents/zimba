import "server-only"
import { mockProjectDetails } from "@/lib/zimba/mock-data"
import type { ProjectDetailResponse } from "@/lib/zimba/types"

export async function getProjectDetail(id: number): Promise<ProjectDetailResponse | undefined> {
  return mockProjectDetails.find((project) => project.id === id)
}
