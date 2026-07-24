import "server-only"

import {
  getPlatformUserDetailUseCase,
  listPlatformUsersUseCase,
  removePlatformUserUseCase,
  updatePlatformUserRoleUseCase,
} from "@workspace/api"
import { apiExecutor, apiTransaction } from "@workspace/api-runtime"
import type {
  PlatformUserDetailDto,
  PlatformUserListDto,
} from "@workspace/contracts"
import type { PlatformRole } from "../auth/service"

export type {
  PlatformUserDetailDto,
  PlatformUserListDto,
} from "@workspace/contracts"

export async function listPlatformUsers(): Promise<PlatformUserListDto[]> {
  return listPlatformUsersUseCase(apiExecutor)
}
export async function getPlatformUserDetail(
  id: string
): Promise<PlatformUserDetailDto | null> {
  return getPlatformUserDetailUseCase(apiExecutor, id)
}

export async function updatePlatformUserRole(
  actorId: string,
  targetId: string,
  role: PlatformRole
) {
  return updatePlatformUserRoleUseCase(apiTransaction, actorId, targetId, role)
}

export async function removePlatformUser(actorId: string, targetId: string) {
  return removePlatformUserUseCase(apiTransaction, actorId, targetId)
}
