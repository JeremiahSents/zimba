import "server-only"

import {
  createWorkspaceAuth,
  parseTrustedOrigins,
  readGoogleOAuthCredentials,
} from "@workspace/auth"
import { sendMagicLinkEmail } from "@workspace/transactional"
import { magicLink } from "better-auth/plugins"
import { env } from "../shared/env"

export const auth = createWorkspaceAuth({
  google: readGoogleOAuthCredentials(),
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await sendMagicLinkEmail({
          to: email,
          loginUrl: url,
          email,
        })
      },
    }),
  ],
  trustedOrigins: parseTrustedOrigins(env.BETTER_AUTH_TRUSTED_ORIGINS),
})

export type AuthSession = typeof auth.$Infer.Session
