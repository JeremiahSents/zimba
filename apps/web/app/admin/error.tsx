"use client"

import { Button, buttonVariants } from "@workspace/ui/components/button"
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
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-background p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--muted))_0%,transparent_60%)]"
      />
      <div className="relative w-full max-w-md text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl border bg-card shadow-sm">
          <svg
            aria-hidden
            className="size-8 text-destructive"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.75"
            viewBox="0 0 24 24"
          >
            <path d="M8.5 16.5a5 5 0 0 1 7 0" />
            <path d="M5 13a10 10 0 0 1 5.24-2.76M14.5 10.5A10 10 0 0 1 19 13" />
            <path d="M2 8.82a15 15 0 0 1 4.17-2.65M10.66 5c4.01-.36 8.14.9 11.34 3.76" />
            <line x1="12" x2="12.01" y1="20" y2="20" />
            <line x1="2" x2="22" y1="2" y2="22" />
          </svg>
        </div>

        <h1 className="mt-6 font-heading font-semibold text-2xl tracking-tight">
          Something went wrong
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-balance text-muted-foreground text-sm leading-relaxed">
          The admin page could not finish loading. Try again, or return home
          and reopen this section.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <Button onClick={() => unstable_retry()}>Try again</Button>
          <a
            className={buttonVariants({ variant: "secondary" })}
            href="/admin/home"
          >
            Back to home
          </a>
        </div>

        {error.digest ? (
          <p className="mt-8 text-muted-foreground/70 text-xs">
            Error reference:{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono">
              {error.digest}
            </code>
          </p>
        ) : null}
      </div>
    </main>
  )
}
