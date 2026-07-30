"use client"

import { Button } from "@workspace/ui/components/button"
import { Field, FieldGroup } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { toast } from "@workspace/ui/components/sonner"
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
  const [isSent, setIsSent] = useState(false)

  async function resend(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!email.includes("@")) {
      toast.error("Enter a valid email address.")
      return
    }

    setIsPending(true)
    const result = await authClient.sendVerificationEmail({
      email,
      callbackURL: `/verify-email?next=${encodeURIComponent(next)}`,
    })
    setIsPending(false)

    if (result?.error) {
      toast.error(
        result.error.message ||
          "We could not send the link. Please try again shortly."
      )
      return
    }
    setIsSent(true)
    toast.success("Confirmation link sent", {
      description: `Check ${email} and open the link.`,
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <FieldGroup>
        <AuthHeader title="Confirm your email" description={reason} />

        {isSent ? (
          <p className="text-center text-muted-foreground text-sm">
            A new confirmation link is on its way to <strong>{email}</strong>.
          </p>
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
