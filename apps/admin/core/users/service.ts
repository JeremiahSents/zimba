import "server-only"

import type {
  AccountRemovalPreviewDto,
  PlatformUserDetailDto,
  PlatformUserListDto,
} from "@workspace/api"
import {
  deactivateUserAccountUseCase,
  deleteUserAccountUseCase,
  getAccountRemovalPreviewUseCase,
  getPlatformUserDetailUseCase,
  listPlatformUsersUseCase,
  reactivateUserAccountUseCase,
  removePlatformUserUseCase,
  updatePlatformUserRoleUseCase,
} from "@workspace/api"
import type { PlatformRole } from "../auth/service"

export type {
  AccountRemovalBlocker,
  AccountRemovalPreviewDto,
  PlatformUserDetailDto,
  PlatformUserListDto,
} from "@workspace/api"

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

export async function getAccountRemovalPreview(
  actorId: string,
  targetId: string
): Promise<AccountRemovalPreviewDto | null> {
  return getAccountRemovalPreviewUseCase(actorId, targetId)
}

export async function deactivateUserAccount(
  actorId: string,
  targetId: string,
  reason?: string
) {
  return deactivateUserAccountUseCase(actorId, targetId, reason)
}

export async function reactivateUserAccount(actorId: string, targetId: string) {
  return reactivateUserAccountUseCase(actorId, targetId)
}

export async function deleteUserAccount(
  actorId: string,
  targetId: string,
  confirmEmail: string
) {
  return deleteUserAccountUseCase(actorId, targetId, confirmEmail)
}
