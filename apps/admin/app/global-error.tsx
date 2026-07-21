"use client"

import { useEffect } from "react"

import { Button } from "@workspace/ui/components/button"

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="en">
      <body>
        <main className="flex min-h-svh items-center justify-center bg-background p-6 text-foreground">
          <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
            <h1 className="font-heading text-2xl font-semibold">Zimba Admin could not finish loading</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Try loading the dashboard again. If the problem continues, check the error reference with the engineering team.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button onClick={() => unstable_retry()}>Try again</Button>
              <Button variant="secondary" onClick={() => window.location.reload()}>
                Reload
              </Button>
            </div>
            {error.digest ? (
              <p className="mt-6 text-xs text-muted-foreground">
                Error reference: <code>{error.digest}</code>
              </p>
            ) : null}
          </div>
        </main>
      </body>
    </html>
  )
}
