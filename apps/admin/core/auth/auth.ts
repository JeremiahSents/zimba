import "server-only"

import { drizzleAdapter } from "@better-auth/drizzle-adapter"
import { betterAuth } from "better-auth"
import { nextCookies } from "better-auth/next-js"
import { db } from "@workspace/db"
import { env } from "../shared/env"
import * as schema from "@workspace/db/schema"

const googleClientId = process.env.GOOGLE_CLIENT_ID
const googleClientSecret =
  process.env.GOOGLE_CLIENT_SECRET ?? process.env.GOOGLE_SECRET

const trustedOrigins = env.BETTER_AUTH_TRUSTED_ORIGINS
  ? env.BETTER_AUTH_TRUSTED_ORIGINS.split(",").map((origin: string) =>
      origin.trim()
    )
  : []

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  experimental: { joins: false },
  socialProviders: {
    google: {
      clientId: googleClientId || "placeholder",
      clientSecret: googleClientSecret || "placeholder",
      prompt: "select_account",
    },
  },
  plugins: [nextCookies()],
  trustedOrigins,
})

export type AuthSession = typeof auth.$Infer.Session
