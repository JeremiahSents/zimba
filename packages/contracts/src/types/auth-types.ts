import type { z } from "zod"
import type { authCredentialsSchema, workspaceRoleSchema } from "../zod"
export type WorkspaceRole = z.infer<typeof workspaceRoleSchema>
export type AuthCredentials = z.infer<typeof authCredentialsSchema>
export type UserDto = { id: string; name: string; email: string; image: string | null }
