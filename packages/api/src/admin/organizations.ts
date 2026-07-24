import type { DatabaseExecutor } from "@workspace/db/repositories"
import {
  findOrganizationDetail,
  listOrganizationsWithStats,
  readOrganizationStats,
  updateOrganizationStatus as updateOrganizationStatusInDb,
} from "@workspace/db/repositories"
import { notFoundError } from "../shared/application-error"

export function listOrganizationsUseCase(deps: { executor: DatabaseExecutor }) {
  return listOrganizationsWithStats(deps.executor)
}

export async function getOrganizationDetailUseCase(
  deps: { executor: DatabaseExecutor },
  id: string
) {
  const org = await findOrganizationDetail(deps.executor, id)
  if (!org) notFoundError("Organization not found.")
  return org
}

export function getOrganizationStatsUseCase(
  deps: { executor: DatabaseExecutor },
  id: string
) {
  return readOrganizationStats(deps.executor, id)
}

export function updateOrganizationStatusUseCase(
  deps: { executor: DatabaseExecutor },
  id: string,
  status: string
) {
  return updateOrganizationStatusInDb(deps.executor, id, status)
}
