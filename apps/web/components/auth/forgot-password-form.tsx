"use client"

import { Button } from "@workspace/ui/components/button"
import { Field, FieldGroup } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import Link from "next/link"
import { useState } from "react"
import { authClient } from "@/lib/auth-client"
import { AuthHeader } from "./auth-header"

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSent, setIsSent] = useState(false)

  async function requestReset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!email.includes("@")) {
      setError("Enter a valid email address.")
      return
    }

    setIsPending(true)
    const result = await authClient.requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    })
    setIsPending(false)

    if (result?.error) {
      setError(
        result.error.message ||
          "We could not send the reset link. Please try again."
      )
      return
    }
    setIsSent(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <FieldGroup>
        <AuthHeader
          title="Forgot your password?"
          description="Enter the email address on your account and we'll send a link to choose a new password."
        />

        {isSent ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-950">
            <p className="font-medium text-sm">Check your email</p>
            <p className="mt-1 text-sm">
              If an account exists for <strong>{email}</strong>, a reset link is
              on its way. The link expires in one hour.
            </p>
          </div>
        ) : (
          <form onSubmit={requestReset} className="flex flex-col gap-3">
            <Field>
              <Label htmlFor="reset-email">Email</Label>
              <Input
                id="reset-email"
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
              {isPending ? "Sending link…" : "Send reset link"}
            </Button>
          </form>
        )}

        {error ? (
          <p role="alert" className="text-center text-destructive text-sm">
            {error}
          </p>
        ) : null}

        <Button variant="ghost" render={<Link href="/login" />}>
          Back to sign in
        </Button>
      </FieldGroup>
    </div>
  )
}
