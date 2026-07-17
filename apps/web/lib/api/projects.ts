import "server-only"
import { getProjectDetail as getDetailService } from "@/core/projects/service"
import type { ProjectDetailResponse } from "@/lib/types"

export async function getProjectDetail(
  id: string
): Promise<ProjectDetailResponse | undefined> {
  return await getDetailService(id)
}
