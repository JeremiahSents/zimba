import "server-only"

import {
  getPlatformUserDetailUseCase,
  listPlatformUsersUseCase,
  removePlatformUserUseCase,
  updatePlatformUserRoleUseCase,
} from "@workspace/api"
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
  return listPlatformUsersUseCase()
}
export async function getPlatformUserDetail(
  id: string
): Promise<PlatformUserDetailDto | null> {
  return getPlatformUserDetailUseCase(id)
}

export async function updatePlatformUserRole(
  actorId: string,
  targetId: string,
  role: PlatformRole
) {
  return updatePlatformUserRoleUseCase(actorId, targetId, role)
}

export async function removePlatformUser(actorId: string, targetId: string) {
  return removePlatformUserUseCase(actorId, targetId)
}
