"use client"

import { Button } from "@workspace/ui/components/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { toast } from "@workspace/ui/components/sonner"
import { cn } from "@workspace/ui/lib/utils"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Google } from "@/components/svgs/google"
import { authClient } from "@/lib/auth-client"
import { AuthHeader } from "./auth-header"
import { showVerificationToast } from "./verification-toast"

export function LoginForm({
  className,
  oauthError = false,
  accessExpired = false,
  passwordReset = false,
  callbackUrl = "/workspace",
  invitation,
  ...props
}: React.ComponentProps<"div"> & {
  oauthError?: boolean
  accessExpired?: boolean
  passwordReset?: boolean
  callbackUrl?: string
  invitation?: {
    organizationName: string
    email: string
  }
}) {
  const [isPending, setIsPending] = useState(false)
  const [mode, setMode] = useState<"signin" | "signup">(
    invitation ? "signup" : "signin"
  )
  const [email, setEmail] = useState(invitation?.email ?? "")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")

  // Server-rendered states arrive as props on first paint, so they are raised
  // once here rather than during render.
  useEffect(() => {
    if (oauthError)
      toast.error("Google sign-in could not be completed", {
        description: "Please try again.",
      })
    if (accessExpired)
      toast.warning("Your workspace access has ended", {
        description:
          "Sign in again, or reopen the workspace from the admin console.",
      })
    if (passwordReset)
      toast.success("Your password was changed", {
        description: "Sign in with your new password.",
      })
  }, [oauthError, accessExpired, passwordReset])

  const newUserCallbackUrl = callbackUrl.startsWith("/invite/")
    ? callbackUrl
    : "/pending-approval"
  // Confirmation links come back through /verify-email, which reports a bad
  // token instead of dumping the visitor on a page that cannot explain itself.
  const verifyCallbackUrl = `/verify-email?next=${encodeURIComponent(newUserCallbackUrl)}`

  async function continueWithGoogle() {
    setIsPending(true)

    const result = await authClient.signIn.social({
      provider: "google",
      callbackURL: callbackUrl,
      newUserCallbackURL: newUserCallbackUrl,
      errorCallbackURL: `/login?error=oauth&callbackUrl=${encodeURIComponent(callbackUrl)}`,
    })

    if (result?.error) {
      toast.error(
        result.error.message || "Google sign-in could not be started."
      )
      setIsPending(false)
    }
  }

  async function continueWithPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!email.includes("@")) {
      toast.error("Enter a valid email address.")
      return
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.")
      return
    }

    setIsPending(true)

    if (mode === "signup") {
      if (name.trim().length < 2) {
        toast.error("Enter your name.")
        setIsPending(false)
        return
      }
      const result = await authClient.signUp.email({
        email,
        password,
        name: name.trim(),
        callbackURL: verifyCallbackUrl,
      })
      setIsPending(false)
      if (result?.error) {
        toast.error(
          result.error.message || "Could not create account. Please try again."
        )
        return
      }
      // Sign-up does not sign them in while verification is required, so tell
      // them where to go next rather than leaving the form looking idle.
      showVerificationToast(email, verifyCallbackUrl)
      setPassword("")
    } else {
      const result = await authClient.signIn.email({
        email,
        password,
        callbackURL: callbackUrl,
      })
      setIsPending(false)
      if (result?.error) {
        // The server has already re-sent the link at this point.
        if (result.error.code === "EMAIL_NOT_VERIFIED") {
          showVerificationToast(email, verifyCallbackUrl)
          return
        }
        toast.error(
          result.error.message || "Could not sign in. Please try again."
        )
        return
      }
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        <AuthHeader
          title={
            invitation
              ? `Join ${invitation.organizationName}`
              : mode === "signin"
                ? "Welcome to Zimba"
                : "Create your account"
          }
          description={
            invitation
              ? `You've been invited to join ${invitation.organizationName} as ${invitation.email}. Sign in or create an account to accept.`
              : mode === "signin"
                ? "Sign in with email and password or Google."
                : "Sign up with email and password or Google."
          }
        />

        <form onSubmit={continueWithPassword} className="flex flex-col gap-3">
          {mode === "signup" ? (
            <Field>
              <Label htmlFor="signup-name">Name</Label>
              <Input
                id="signup-name"
                type="text"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isPending}
                required
              />
            </Field>
          ) : null}
          <Field>
            <Label htmlFor="auth-email">Email</Label>
            <Input
              id="auth-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isPending}
              required
            />
          </Field>
          <Field>
            <div className="flex items-center justify-between">
              <Label htmlFor="auth-password">Password</Label>
              {mode === "signin" ? (
                <Link
                  href="/forgot-password"
                  className="text-muted-foreground text-xs hover:text-foreground"
                >
                  Forgot password?
                </Link>
              ) : null}
            </div>
            <Input
              id="auth-password"
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            {isPending
              ? mode === "signin"
                ? "Signing in…"
                : "Creating account…"
              : mode === "signin"
                ? "Sign in"
                : "Create account"}
          </Button>
        </form>

        <button
          type="button"
          className="text-center text-muted-foreground text-xs hover:text-foreground"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin")
            toast.dismiss()
          }}
        >
          {mode === "signin"
            ? "Don't have an account? Sign up"
            : "Already have an account? Sign in"}
        </button>

        <div className="relative my-1">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">or</span>
          </div>
        </div>

        <Field>
          <Button
            variant="secondary"
            type="button"
            size="lg"
            className="h-11 w-full"
            disabled={isPending}
            onClick={continueWithGoogle}
          >
            <Google className="size-5" aria-hidden="true" />
            {isPending ? "Continuing with Google…" : "Continue with Google"}
          </Button>
        </Field>
      </FieldGroup>

      <FieldDescription className="px-6 text-center">
        By continuing, you agree to our <a href="#terms">Terms of Service</a>{" "}
        and <a href="#privacy">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}
