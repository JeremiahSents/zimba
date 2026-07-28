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
  /**
   * Share the session cookie across subdomains (e.g. ".zimba.digital"), so a
   * session started on the admin app is recognised by the customer app.
   * Leave undefined to keep cookies host-only — then staff sign in to each app
   * separately, which is the safer default.
   */
  cookieDomain?: string
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
    ...(options.cookieDomain
      ? {
          advanced: {
            crossSubDomainCookies: {
              enabled: true,
              domain: options.cookieDomain,
            },
          },
        }
      : {}),
  })
}

/**
 * Reads the shared cookie domain. Unset means host-only cookies, which is the
 * default: widening the cookie sends every user's session to every subdomain.
 */
export function readAuthCookieDomain(): string | undefined {
  const value = process.env.AUTH_COOKIE_DOMAIN?.trim()
  return value ? value : undefined
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
