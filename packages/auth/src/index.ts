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

/**
 * Better Auth hands us `url` already pointing at its own
 * `/reset-password/:token` endpoint, which validates the token and then
 * redirects to the app page the request named. Emailing that URL — rather than
 * building one from the raw token — is what keeps expired links landing on
 * `?error=INVALID_TOKEN` instead of a broken form.
 */
export type SendResetPassword = (input: {
  user: { id: string; email: string; name: string }
  url: string
  token: string
}) => Promise<void>

/**
 * `url` already carries the token and the callback the caller asked for, so the
 * email only has to render it.
 */
export type SendVerificationEmail = (input: {
  user: { id: string; email: string; name: string }
  url: string
  token: string
}) => Promise<void>

export type WorkspaceAuthOptions = {
  google: GoogleOAuthCredentials
  /**
   * Injected per app, like the magic-link sender, so this package never depends
   * on the email transport.
   */
  sendResetPassword?: SendResetPassword
  /**
   * Supplying this turns email verification on, which is what makes
   * `user.emailVerified` — and therefore account linking — trustworthy.
   */
  sendVerificationEmail?: SendVerificationEmail
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
    account: {
      /**
       * One person, one user row, whichever way they sign in. Without this,
       * someone who signed up with a password and later clicks "Continue with
       * Google" is told an account already exists, with no way forward.
       *
       * Both sides of the link have to prove they own the address:
       * - `trustedProviders: ["google"]` accepts Google's `email_verified`
       *   claim, so the incoming identity is vouched for.
       * - `requireLocalEmailVerified` stays at its secure default of true, so
       *   the existing local account must have confirmed its email too. This is
       *   what stops someone registering an unverified password account on an
       *   address they do not own and having it linked when the real owner later
       *   arrives via Google.
       *
       * That default is only usable because `emailVerification` below is
       * configured — without it no password account is ever verified and
       * linking could never succeed.
       */
      accountLinking: {
        enabled: true,
        trustedProviders: ["google"],
        requireLocalEmailVerified: true,
      },
    },
    plugins: [nextCookies(), ...(options.plugins ?? [])],
    emailAndPassword: {
      enabled: true,
      ...(options.sendVerificationEmail
        ? {
            /**
             * No sign-in until the address is confirmed. Without this,
             * `emailVerified` would stay false for anyone who ignored the email,
             * and the linking rule above would lock them out of Google forever.
             */
            requireEmailVerification: true,
          }
        : {}),
      ...(options.sendResetPassword
        ? {
            sendResetPassword: options.sendResetPassword,
            /** Short enough that a leaked inbox is a narrow window. */
            resetPasswordTokenExpiresIn: 60 * 60,
            /**
             * A password reset is how someone recovers a compromised account,
             * so every session opened with the old password has to die with it.
             */
            revokeSessionsOnPasswordReset: true,
          }
        : {}),
    },
    ...(options.sendVerificationEmail
      ? {
          emailVerification: {
            sendVerificationEmail: options.sendVerificationEmail,
            sendOnSignUp: true,
            /**
             * Re-sends on a blocked sign-in. This is what carries accounts that
             * predate verification: they try to sign in, are refused, and the
             * fresh link is already waiting for them.
             */
            sendOnSignIn: true,
            /** Clicking the link is proof enough — don't ask them to sign in again. */
            autoSignInAfterVerification: true,
            /** Longer than a password reset: these get opened the next morning. */
            expiresIn: 60 * 60 * 24,
          },
        }
      : {}),
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
