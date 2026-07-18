import "server-only"

import { drizzleAdapter } from "@better-auth/drizzle-adapter"
import { betterAuth } from "better-auth"
import { nextCookies } from "better-auth/next-js"
import { db } from "../shared/db"
import * as schema from "./schema"

const googleClientId = process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET ?? process.env.GOOGLE_SECRET
if (!googleClientId || !googleClientSecret) throw new Error("Google OAuth credentials are required.")

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  socialProviders: { google: { clientId: googleClientId, clientSecret: googleClientSecret, prompt: "select_account" } },
  plugins: [nextCookies()],
})

export type AuthSession = typeof auth.$Infer.Session
