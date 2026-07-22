export type PlatformRole = "super_admin" | "support" | "none"
export type PlatformUserDto = { id: string; userId: string; role: PlatformRole }
