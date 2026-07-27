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
  platformRole: PlatformUserRole | null
  membershipsCount: number
  primaryOrganization: string | null
}
export type PlatformUserDetailDto = PlatformUserListDto & {
  emailVerified: boolean
  memberships: Array<{
    organizationId: string
    organizationName: string
    role: string
  }>
}
