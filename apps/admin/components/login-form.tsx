"use client"

import { createAuthClient } from "better-auth/react"
import { Button } from "@workspace/ui/components/button"
import { useState } from "react"

const authClient = createAuthClient()

export function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function signIn() {
    setError(null)
    setPending(true)
    const result = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
      errorCallbackURL: "/login?error=oauth",
    })
    if (result?.error) {
      setError(result.error.message || "Could not start sign in.")
      setPending(false)
    }
  }

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6 rounded-xl border bg-background p-8">
        <div className="space-y-2 text-center">
          <h1 className="font-semibold text-2xl">Zimba Admin</h1>
          <p className="text-muted-foreground text-sm">Sign in to continue.</p>
        </div>
        <Button className="w-full" onClick={signIn} disabled={pending}>
          {pending ? "Redirecting…" : "Continue with Google"}
        </Button>
        {error ? <p className="text-destructive text-sm">{error}</p> : null}
      </div>
    </main>
  )
}
