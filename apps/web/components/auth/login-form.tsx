"use client"

import { Button } from "@workspace/ui/components/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
} from "@workspace/ui/components/field"
import { cn } from "@workspace/ui/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Google } from "@/components/svgs/google"
import { authClient } from "@/lib/auth-client"

export function LoginForm({
  className,
  oauthError = false,
  ...props
}: React.ComponentProps<"div"> & { oauthError?: boolean }) {
  const [error, setError] = useState<string | null>(
    oauthError
      ? "Google sign-in could not be completed. Please try again."
      : null
  )
  const [isPending, setIsPending] = useState(false)

  async function continueWithGoogle() {
    setError(null)
    setIsPending(true)

    const result = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/admin/home",
      newUserCallbackURL: "/onboarding",
      errorCallbackURL: "/login?error=oauth",
    })

    if (result?.error) {
      setError(result.error.message || "Google sign-in could not be started.")
      setIsPending(false)
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
                className="size-7"
              />
            </div>
            <span className="sr-only">Zimba</span>
          </Link>
          <h1 className="font-bold text-xl">Welcome to Zimba</h1>
          <FieldDescription>
            Continue with Google to sign in or create your account.
          </FieldDescription>
        </div>

        <Field>
          <Button
            variant="outline"
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
