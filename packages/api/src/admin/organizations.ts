import { db } from "@workspace/db"

import {
  findOrganizationDetail,
  listOrganizationsWithStats,
  readOrganizationStats,
  updateOrganizationStatus as updateOrganizationStatusInDb,
} from "@workspace/db/repositories"
import { notFoundError } from "../shared/application-error"

export function listOrganizationsUseCase() {
  return listOrganizationsWithStats(db)
}

export async function getOrganizationDetailUseCase(
  id: string
) {
  const org = await findOrganizationDetail(db, id)
  if (!org) notFoundError("Organization not found.")
  return org
}

export function getOrganizationStatsUseCase(
  id: string
) {
  return readOrganizationStats(db, id)
}

export function updateOrganizationStatusUseCase(
  id: string,
  status: string
) {
  return updateOrganizationStatusInDb(db, id, status)
}
