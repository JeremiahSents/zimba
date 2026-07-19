import "server-only"

import { drizzleAdapter } from "@better-auth/drizzle-adapter"
import { betterAuth } from "better-auth"
import { nextCookies } from "better-auth/next-js"
import { db } from "../shared/db"
import { env } from "../shared/env"
import * as schema from "./schema"

const googleClientId = process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET ?? process.env.GOOGLE_SECRET
if (!googleClientId || !googleClientSecret) throw new Error("Google OAuth credentials are required.")

const trustedOrigins = env.BETTER_AUTH_TRUSTED_ORIGINS
  ? env.BETTER_AUTH_TRUSTED_ORIGINS.split(",").map((origin) => origin.trim())
  : []

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  // Keep session reads on the adapter's explicit query path. The experimental
  // relation join path intermittently logs fallback-join errors in dev when
  // Next refreshes a request while the session cookie is being revalidated.
  experimental: { joins: false },
  socialProviders: { google: { clientId: googleClientId, clientSecret: googleClientSecret, prompt: "select_account" } },
  plugins: [nextCookies()],
  trustedOrigins,
})

export type AuthSession = typeof auth.$Infer.Session
