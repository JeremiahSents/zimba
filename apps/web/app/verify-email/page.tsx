import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { VerifyEmailNotice } from "@/components/auth/verify-email-notice"

export const metadata: Metadata = {
  title: "Confirm your email | Zimba",
  description: "Confirm your email address to finish setting up Zimba.",
}

export const dynamic = "force-dynamic"

/**
 * Better Auth's own `/verify-email` endpoint does the work, then redirects here:
 * with `?error=<code>` when the token was bad, and with nothing when it worked.
 * So arriving clean means the account is verified and already signed in, and the
 * only thing left is to send them where they were going.
 */
const reasons: Record<string, string> = {
  TOKEN_EXPIRED:
    "That link has expired. Enter your email and we'll send a fresh one.",
  INVALID_TOKEN:
    "That link is not valid — it may already have been used. Enter your email for a new one.",
  USER_NOT_FOUND:
    "We could not find an account for that link. Enter your email to try again.",
}

function safeNext(next: string | undefined): string {
  // Never bounce to an absolute URL from a query parameter.
  return next?.startsWith("/") && !next.startsWith("//") ? next : "/workspace"
}

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>
}) {
  const { error, next } = await searchParams
  const destination = safeNext(next)

  if (!error) redirect(destination)

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <VerifyEmailNotice
          reason={
            reasons[error] ??
            "We could not confirm your email with that link. Enter your email and we'll send a new one."
          }
          next={destination}
        />
      </div>
    </div>
  )
}
