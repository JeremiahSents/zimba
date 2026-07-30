"use client"

import { Button } from "@workspace/ui/components/button"
import { Field, FieldGroup } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import Link from "next/link"
import { useState } from "react"
import { authClient } from "@/lib/auth-client"
import { AuthHeader } from "./auth-header"

/**
 * Shown when a verification link did not work. Every case is recoverable by
 * asking for another link, so that is the only thing this page does.
 */
export function VerifyEmailNotice({
  reason,
  next,
}: {
  reason: string
  next: string
}) {
  const [email, setEmail] = useState("")
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSent, setIsSent] = useState(false)

  async function resend(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!email.includes("@")) {
      setError("Enter a valid email address.")
      return
    }

    setIsPending(true)
    const result = await authClient.sendVerificationEmail({
      email,
      callbackURL: `/verify-email?next=${encodeURIComponent(next)}`,
    })
    setIsPending(false)

    if (result?.error) {
      setError(
        result.error.message ||
          "We could not send the link. Please try again shortly."
      )
      return
    }
    setIsSent(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <FieldGroup>
        <AuthHeader title="Confirm your email" description={reason} />

        {isSent ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-950">
            <p className="font-medium text-sm">Check your email</p>
            <p className="mt-1 text-sm">
              A new confirmation link is on its way to <strong>{email}</strong>.
            </p>
          </div>
        ) : (
          <form onSubmit={resend} className="flex flex-col gap-3">
            <Field>
              <Label htmlFor="verify-email">Email</Label>
              <Input
                id="verify-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={isPending}
                required
              />
            </Field>
            <Button
              type="submit"
              size="lg"
              className="h-11 w-full"
              disabled={isPending}
            >
              {isPending ? "Sending link…" : "Send a new link"}
            </Button>
          </form>
        )}

        {error ? (
          <p role="alert" className="text-center text-destructive text-sm">
            {error}
          </p>
        ) : null}

        <Button
          variant="ghost"
          nativeButton={false}
          render={<Link href="/login" />}
        >
          Back to sign in
        </Button>
      </FieldGroup>
    </div>
  )
}
