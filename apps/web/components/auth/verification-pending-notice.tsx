"use client"

import { useState } from "react"
import { authClient } from "@/lib/auth-client"

/**
 * Shown on the login form once a confirmation link has gone out — either from
 * signing up, or from a sign-in refused because the address is unconfirmed.
 * The link is already sent by the time this renders; resending is for the case
 * where it never arrived.
 */
export function VerificationPendingNotice({
  email,
  callbackUrl,
}: {
  email: string
  callbackUrl: string
}) {
  const [isResending, setIsResending] = useState(false)
  const [resentAt, setResentAt] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function resend() {
    setError(null)
    setIsResending(true)
    const result = await authClient.sendVerificationEmail({
      email,
      callbackURL: callbackUrl,
    })
    setIsResending(false)
    if (result?.error) {
      setError(
        result.error.message || "We could not send it. Try again shortly."
      )
      return
    }
    setResentAt(Date.now())
  }

  return (
    <div className="space-y-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-950 text-sm">
      <p className="font-medium">Confirm your email to continue</p>
      <p>
        We sent a confirmation link to <strong>{email}</strong>. Open it and
        you&apos;ll be signed in — after that, Google sign-in works on this
        account too.
      </p>
      {resentAt ? (
        <p className="font-medium">Sent again just now.</p>
      ) : (
        <button
          type="button"
          className="font-medium underline disabled:opacity-60"
          disabled={isResending}
          onClick={resend}
        >
          {isResending ? "Sending…" : "Send it again"}
        </button>
      )}
      {error ? (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}
