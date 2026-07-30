import "server-only"

import {
  createWorkspaceAuth,
  parseTrustedOrigins,
  readAuthCookieDomain,
  readGoogleOAuthCredentials,
} from "@workspace/auth"
import {
  sendEmailVerificationEmail,
  sendMagicLinkEmail,
  sendResetPasswordEmail,
} from "@workspace/transactional"
import { magicLink } from "better-auth/plugins"
import { env } from "../shared/env"

export const auth = createWorkspaceAuth({
  google: readGoogleOAuthCredentials(),
  sendResetPassword: async ({ user, url }) => {
    await sendResetPasswordEmail({
      to: user.email,
      resetUrl: url,
      email: user.email,
    })
  },
  sendVerificationEmail: async ({ user, url }) => {
    await sendEmailVerificationEmail({
      to: user.email,
      verifyUrl: url,
      email: user.email,
    })
  },
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
  cookieDomain: readAuthCookieDomain(),
})

export type AuthSession = typeof auth.$Infer.Session
