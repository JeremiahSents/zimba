import "server-only"

import { drizzleAdapter } from "@better-auth/drizzle-adapter"
import { db } from "@workspace/db"
import * as schema from "@workspace/db/schema"
import { betterAuth } from "better-auth"
import { nextCookies } from "better-auth/next-js"

export type GoogleOAuthCredentials = {
  clientId: string
  clientSecret: string
}

export type WorkspaceAuthOptions = {
  google: GoogleOAuthCredentials
  trustedOrigins?: string[]
  plugins?: Parameters<typeof betterAuth>[0]["plugins"]
}

export function createWorkspaceAuth(options: WorkspaceAuthOptions) {
  return betterAuth({
    database: drizzleAdapter(db, { provider: "pg", schema }),
    experimental: { joins: false },
    socialProviders: {
      google: {
        clientId: options.google.clientId,
        clientSecret: options.google.clientSecret,
        prompt: "select_account",
      },
    },
    plugins: [nextCookies(), ...(options.plugins ?? [])],
    emailAndPassword: { enabled: true },
    trustedOrigins: options.trustedOrigins ?? [],
  })
}

export function parseTrustedOrigins(value: string | undefined) {
  return value
    ? value
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
    : []
}

export function readGoogleOAuthCredentials(options?: {
  requireCredentials?: boolean
  placeholder?: GoogleOAuthCredentials
}): GoogleOAuthCredentials {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret =
    process.env.GOOGLE_CLIENT_SECRET ?? process.env.GOOGLE_SECRET

  if (clientId && clientSecret) return { clientId, clientSecret }
  if (options?.placeholder) return options.placeholder
  if (options?.requireCredentials === false)
    return { clientId: "placeholder", clientSecret: "placeholder" }

  throw new Error("Google OAuth credentials are required.")
}
