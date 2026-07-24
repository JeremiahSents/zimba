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
import { db } from "@workspace/db"
import type { PlatformRole } from "../auth/service"

export type {
  PlatformUserDetailDto,
  PlatformUserListDto,
} from "@workspace/contracts"

export async function listPlatformUsers(): Promise<PlatformUserListDto[]> {
  return listPlatformUsersUseCase({ executor: db })
}
export async function getPlatformUserDetail(
  id: string
): Promise<PlatformUserDetailDto | null> {
  return getPlatformUserDetailUseCase({ executor: db }, id)
}

export async function updatePlatformUserRole(
  actorId: string,
  targetId: string,
  role: PlatformRole
) {
  return updatePlatformUserRoleUseCase(
    { transaction: (callback) => db.transaction(callback) },
    actorId,
    targetId,
    role
  )
}

export async function removePlatformUser(actorId: string, targetId: string) {
  return removePlatformUserUseCase(
    { transaction: (callback) => db.transaction(callback) },
    actorId,
    targetId
  )
}
