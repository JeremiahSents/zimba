"use client"

import { buttonVariants } from "@workspace/ui/components/button"
import Link from "next/link"
import { useEffect } from "react"

export default function WorkspaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="font-semibold text-2xl">Something went wrong</h1>
      <p className="max-w-md text-muted-foreground">
        An unexpected error occurred while loading this workspace.
      </p>
      {error.digest && (
        <p className="text-muted-foreground text-xs">
          Error reference: {error.digest}
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          className={buttonVariants({ variant: "default" })}
          onClick={reset}
        >
          Try again
        </button>
        <Link href="/login" className={buttonVariants({ variant: "outline" })}>
          Back to login
        </Link>
      </div>
    </div>
  )
}
