"use client"

import { Button } from "@workspace/ui/components/button"
import { useEffect } from "react"

export default function AdminError({
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
    <main className="flex min-h-svh items-center justify-center bg-background p-6">
      <div className="w-full max-w-md rounded-xl border bg-card p-8 text-center shadow-sm">
        <h1 className="font-heading font-semibold text-xl">
          The backend could not be reached
        </h1>
        <p className="mt-2 text-muted-foreground text-sm">
          Check the configured API session and organization, then try again.
        </p>
        <Button className="mt-6" onClick={() => unstable_retry()}>
          Try again
        </Button>
      </div>
    </main>
  )
}
