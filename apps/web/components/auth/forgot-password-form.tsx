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

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [isPending, setIsPending] = useState(false)
  const [isSent, setIsSent] = useState(false)

  async function requestReset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!email.includes("@")) {
      toast.error("Enter a valid email address.")
      return
    }

    setIsPending(true)
    const result = await authClient.requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    })
    setIsPending(false)

    if (result?.error) {
      toast.error(
        result.error.message ||
          "We could not send the reset link. Please try again."
      )
      return
    }
    // The form is replaced by a standing note as well as the toast: this is the
    // whole purpose of the page, so it should survive the toast timing out.
    setIsSent(true)
    toast.success("Check your email", {
      description: `If an account exists for ${email}, a reset link is on its way.`,
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <FieldGroup>
        <AuthHeader
          title="Forgot your password?"
          description="Enter the email address on your account and we'll send a link to choose a new password."
        />

        {isSent ? (
          <p className="text-center text-muted-foreground text-sm">
            If an account exists for <strong>{email}</strong>, a reset link is
            on its way. The link expires in one hour.
          </p>
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
