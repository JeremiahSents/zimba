import "server-only"

import { getZimbaApiSession } from "@/lib/api/auth"
import {
  getProjectDetail as getProjectDetailFromApi,
  listUpcomingPayments,
} from "@/lib/api/client"
import { mockProjectDetails } from "@/lib/api/mock-data"
import { toProjectDetail } from "@/lib/api/normalizers"
import type { ProjectDetailResponse } from "@/lib/types"

export async function getProjectDetail(
  id: number
): Promise<ProjectDetailResponse | undefined> {
  const session = getZimbaApiSession()
  if (!session) return mockProjectDetails.find((project) => project.id === id)

  const [project, upcomingPayments] = await Promise.all([
    getProjectDetailFromApi(session, id),
    listUpcomingPayments(session, id),
  ])
  project.upcoming_payments = upcomingPayments
  return toProjectDetail(project)
}
