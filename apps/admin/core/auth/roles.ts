export const platformRoles = ["super_admin", "support"] as const
export type PlatformRole = (typeof platformRoles)[number]
export type PlatformAccess = PlatformRole | null
