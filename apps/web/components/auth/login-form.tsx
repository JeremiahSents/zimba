"use client"

import { Button } from "@workspace/ui/components/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { cn } from "@workspace/ui/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Google } from "@/components/svgs/google"
import { authClient } from "@/lib/auth-client"

export function LoginForm({
  className,
  oauthError = false,
  callbackUrl = "/workspace",
  ...props
}: React.ComponentProps<"div"> & {
  oauthError?: boolean
  callbackUrl?: string
}) {
  const [error, setError] = useState<string | null>(
    oauthError
      ? "Google sign-in could not be completed. Please try again."
      : null
  )
  const [isPending, setIsPending] = useState(false)
  const [mode, setMode] = useState<"signin" | "signup">("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const newUserCallbackUrl = callbackUrl.startsWith("/invite/")
    ? callbackUrl
    : "/onboarding"

  async function continueWithGoogle() {
    setError(null)
    setIsPending(true)

    const result = await authClient.signIn.social({
      provider: "google",
      callbackURL: callbackUrl,
      newUserCallbackURL: newUserCallbackUrl,
      errorCallbackURL: `/login?error=oauth&callbackUrl=${encodeURIComponent(callbackUrl)}`,
    })

    if (result?.error) {
      setError(result.error.message || "Google sign-in could not be started.")
      setIsPending(false)
    }
  }

  async function continueWithPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!email.includes("@")) {
      setError("Enter a valid email address.")
      return
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }

    setIsPending(true)

    if (mode === "signup") {
      if (name.trim().length < 2) {
        setError("Enter your name.")
        setIsPending(false)
        return
      }
      const result = await authClient.signUp.email({
        email,
        password,
        name: name.trim(),
        callbackURL: newUserCallbackUrl,
      })
      setIsPending(false)
      if (result?.error) {
        setError(
          result.error.message || "Could not create account. Please try again."
        )
        return
      }
    } else {
      const result = await authClient.signIn.email({
        email,
        password,
        callbackURL: callbackUrl,
      })
      setIsPending(false)
      if (result?.error) {
        setError(result.error.message || "Could not sign in. Please try again.")
        return
      }
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-2 text-center">
          <Link
            href="/"
            className="flex flex-col items-center gap-2 font-medium"
          >
            <div className="flex size-8 items-center justify-center rounded-md">
              <Image
                src="/logo-landing.png"
                alt="Zimba logo"
                width={28}
                height={28}
                style={{ width: "auto", height: "auto" }}
                className="size-7"
              />
            </div>
            <span className="sr-only">Zimba</span>
          </Link>
          <h1 className="font-bold text-xl">
            {mode === "signin" ? "Welcome to Zimba" : "Create your account"}
          </h1>
          <FieldDescription>
            {mode === "signin"
              ? "Sign in with email and password or Google."
              : "Sign up with email and password or Google."}
          </FieldDescription>
        </div>

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
            <Label htmlFor="auth-password">Password</Label>
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
            setError(null)
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

        {error ? (
          <p
            role="alert"
            className="text-center text-destructive text-sm leading-5"
          >
            {error}
          </p>
        ) : null}
      </FieldGroup>

      <FieldDescription className="px-6 text-center">
        By continuing, you agree to our <a href="#terms">Terms of Service</a>{" "}
        and <a href="#privacy">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}
