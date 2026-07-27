import "server-only"
import {
  getOrganizationDetailUseCase,
  getOrganizationStatsUseCase,
  listOrganizationsUseCase,
  updateOrganizationStatusUseCase,
} from "@workspace/api"
import { requirePlatformRole } from "../auth/service"

export async function listOrganizations() {
  return listOrganizationsUseCase()
}

export async function getOrganizationDetail(id: string) {
  return getOrganizationDetailUseCase(id)
}

export async function getOrganizationStats(id: string) {
  return getOrganizationStatsUseCase(id)
}

export async function updateOrganizationStatus(id: string, status: string) {
  await requirePlatformRole(["super_admin"])
  return updateOrganizationStatusUseCase(id, status)
}
