import "server-only"
import {
  getOrganizationDetailUseCase,
  getOrganizationStatsUseCase,
  listOrganizationsUseCase,
  updateOrganizationStatusUseCase,
} from "@workspace/api"
import { db } from "@workspace/db"
import { requirePlatformRole } from "../auth/service"

export async function listOrganizations() {
  return listOrganizationsUseCase({ executor: db })
}

export async function getOrganizationDetail(id: string) {
  return getOrganizationDetailUseCase({ executor: db }, id)
}

export async function getOrganizationStats(id: string) {
  return getOrganizationStatsUseCase({ executor: db }, id)
}

export async function updateOrganizationStatus(id: string, status: string) {
  await requirePlatformRole(["super_admin"])
  return updateOrganizationStatusUseCase({ executor: db }, id, status)
}
