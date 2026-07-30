"use client"

import { Button } from "@workspace/ui/components/button"
import { Field, FieldGroup } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { authClient } from "@/lib/auth-client"
import { AuthHeader } from "./auth-header"

const minimumPasswordLength = 8

/**
 * `token` arrives as a query parameter, put there by Better Auth's
 * `/reset-password/:token` endpoint once it has checked the token is live. An
 * absent token means the link expired or was tampered with, so the form asks
 * for a fresh one rather than failing on submit.
 */
export function ResetPasswordForm({
  token,
  linkError,
}: {
  token: string | null
  linkError: boolean
}) {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDone, setIsDone] = useState(false)

  async function submitNewPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (password.length < minimumPasswordLength) {
      setError(`Password must be at least ${minimumPasswordLength} characters.`)
      return
    }
    if (password !== confirmPassword) {
      setError("Both passwords must match.")
      return
    }
    if (!token) {
      setError("This reset link is no longer valid. Request a new one.")
      return
    }

    setIsPending(true)
    const result = await authClient.resetPassword({
      newPassword: password,
      token,
    })
    setIsPending(false)

    if (result?.error) {
      setError(
        result.error.message ||
          "We could not reset your password. Request a new link."
      )
      return
    }

    setIsDone(true)
    router.push("/login?reset=1")
  }

  const isLinkUsable = Boolean(token) && !linkError

  return (
    <div className="flex flex-col gap-6">
      <FieldGroup>
        <AuthHeader
          title="Choose a new password"
          description={
            isLinkUsable
              ? "Signing in elsewhere will stop working once you set a new password."
              : "This reset link has expired or has already been used."
          }
        />

        {isLinkUsable ? (
          <form onSubmit={submitNewPassword} className="flex flex-col gap-3">
            <Field>
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                placeholder={`At least ${minimumPasswordLength} characters`}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={isPending || isDone}
                required
              />
            </Field>
            <Field>
              <Label htmlFor="confirm-password">Confirm new password</Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                disabled={isPending || isDone}
                required
              />
            </Field>
            <Button
              type="submit"
              size="lg"
              className="h-11 w-full"
              disabled={isPending || isDone}
            >
              {isPending ? "Saving password…" : "Save new password"}
            </Button>
          </form>
        ) : (
          <Button
            size="lg"
            className="h-11 w-full"
            render={<Link href="/forgot-password" />}
          >
            Request a new link
          </Button>
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
