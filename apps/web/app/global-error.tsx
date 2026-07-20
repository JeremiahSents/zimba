"use client"

import { Button } from "@workspace/ui/components/button"
import { useEffect } from "react"

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
            <h1 className="font-heading font-semibold text-2xl">Zimba could not finish loading</h1>
            <p className="mt-3 text-muted-foreground text-sm">
              Try loading the application again. If the problem continues, contact support with the error reference.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button onClick={() => unstable_retry()}>Try again</Button>
              <Button variant="secondary" onClick={() => window.location.reload()}>Reload</Button>
            </div>
            {error.digest ? <p className="mt-6 text-muted-foreground text-xs">Error reference: <code>{error.digest}</code></p> : null}
          </div>
        </main>
      </body>
    </html>
  )
}
