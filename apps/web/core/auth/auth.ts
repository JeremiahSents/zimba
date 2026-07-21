import "server-only"

import { drizzleAdapter } from "@better-auth/drizzle-adapter"
import { db } from "@workspace/db"
import * as schema from "@workspace/db/schema"
import { sendMagicLinkEmail } from "@workspace/transactional"
import { betterAuth } from "better-auth"
import { nextCookies } from "better-auth/next-js"
import { magicLink } from "better-auth/plugins"
import { env } from "../shared/env"

const googleClientId = process.env.GOOGLE_CLIENT_ID
const googleClientSecret =
  process.env.GOOGLE_CLIENT_SECRET ?? process.env.GOOGLE_SECRET
if (!googleClientId || !googleClientSecret)
  throw new Error("Google OAuth credentials are required.")

const trustedOrigins = env.BETTER_AUTH_TRUSTED_ORIGINS
  ? env.BETTER_AUTH_TRUSTED_ORIGINS.split(",").map((origin) => origin.trim())
  : []

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  experimental: { joins: false },
  socialProviders: {
    google: {
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      prompt: "select_account",
    },
  },
  plugins: [
    nextCookies(),
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
  trustedOrigins,
})

export type AuthSession = typeof auth.$Infer.Session
