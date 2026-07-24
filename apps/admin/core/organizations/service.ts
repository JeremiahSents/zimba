import "server-only"
import {
  getOrganizationDetailUseCase,
  getOrganizationStatsUseCase,
  listOrganizationsUseCase,
  updateOrganizationStatusUseCase,
} from "@workspace/api"
import { apiExecutor } from "@workspace/api-runtime"
import { requirePlatformRole } from "../auth/service"

export async function listOrganizations() {
  return listOrganizationsUseCase(apiExecutor)
}

export async function getOrganizationDetail(id: string) {
  return getOrganizationDetailUseCase(apiExecutor, id)
}

export async function getOrganizationStats(id: string) {
  return getOrganizationStatsUseCase(apiExecutor, id)
}

export async function updateOrganizationStatus(id: string, status: string) {
  await requirePlatformRole(["super_admin"])
  return updateOrganizationStatusUseCase(apiExecutor, id, status)
}
