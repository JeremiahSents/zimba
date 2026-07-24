import "server-only"

import {
  createWorkspaceAuth,
  parseTrustedOrigins,
  readGoogleOAuthCredentials,
} from "@workspace/auth"
import { env } from "../shared/env"

export const auth = createWorkspaceAuth({
  google: readGoogleOAuthCredentials({ requireCredentials: false }),
  trustedOrigins: parseTrustedOrigins(env.BETTER_AUTH_TRUSTED_ORIGINS),
})

export type AuthSession = typeof auth.$Infer.Session
