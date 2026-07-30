export type PlatformUserRole = "super_admin" | "support" | "none"
export type PlatformUserDto = {
  id: string
  userId: string
  role: PlatformUserRole
}
export type PlatformUserListDto = {
  id: string
  name: string
  email: string
  image: string | null
  createdAt: Date
  deactivatedAt: Date | null
  platformRole: PlatformUserRole | null
  membershipsCount: number
  primaryOrganization: string | null
}
export type PlatformUserDetailDto = PlatformUserListDto & {
  emailVerified: boolean
  deactivationReason: string | null
  memberships: Array<{
    organizationId: string
    organizationName: string
    role: string
  }>
}

/** Why an account cannot be permanently deleted yet. */
export type AccountRemovalBlockerCode =
  | "SELF"
  | "SOLE_OWNER"
  | "LAST_SUPER_ADMIN"
  | "PENDING_INVITATIONS"

export type AccountRemovalBlocker = {
  code: AccountRemovalBlockerCode
  message: string
  organizationId?: string
  organizationName?: string
}

export type AccountRemovalPreviewDto = {
  userId: string
  name: string
  email: string
  deactivatedAt: Date | null
  deactivationReason: string | null
  blockers: AccountRemovalBlocker[]
  canDelete: boolean
}
