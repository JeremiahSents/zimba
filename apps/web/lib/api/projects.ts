import "server-only"

import { requireZimbaApiSession } from "@/lib/api/auth"
import {
  getProjectDetail as getProjectDetailFromApi,
  listUpcomingPayments,
} from "@/lib/api/client"
import { isMockDataMode } from "@/lib/api/data-mode"
import { getMockProjectDetail } from "@/lib/api/mock-repository"
import { toProjectDetail } from "@/lib/api/normalizers"
import type { ProjectDetailResponse } from "@/lib/types"

export async function getProjectDetail(
  id: number
): Promise<ProjectDetailResponse | undefined> {
  const session = await requireZimbaApiSession()
  if (isMockDataMode()) {
    return getMockProjectDetail(session.organizationId, id)
  }

  const [project, upcomingPayments] = await Promise.all([
    getProjectDetailFromApi(session, id),
    listUpcomingPayments(session, id),
  ])
  project.upcoming_payments = upcomingPayments
  return toProjectDetail(project)
}
