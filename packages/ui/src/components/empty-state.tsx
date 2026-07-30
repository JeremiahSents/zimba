import { cn } from "@workspace/ui/lib/utils"
import type { ReactNode } from "react"

/**
 * The empty state used across dashboard surfaces.
 *
 * A ghosted preview of the content that will appear here sits behind the copy,
 * faded out so it reads as a hint rather than as loading. The point is that an
 * empty surface should still show its own shape — a bare icon and a button
 * leaves people unsure whether the page is empty or broken.
 */
function EmptyState({
  title,
  description,
  action,
  preview,
  className,
}: {
  title: string
  description: string
  action?: ReactNode
  /** Ghosted content shape. Use EmptyStateCards or EmptyStateRows. */
  preview?: ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        "relative isolate flex min-h-[22rem] flex-col items-center justify-center overflow-hidden rounded-2xl border border-border border-dashed bg-card/40 px-6 py-14 text-center sm:min-h-[26rem]",
        className
      )}
    >
      {preview ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 flex justify-center px-6 pt-10 opacity-70 [mask-image:linear-gradient(to_bottom,black_10%,transparent_85%)]"
        >
          {preview}
        </div>
      ) : null}

      <div className="relative z-10 flex max-w-sm flex-col items-center gap-2.5">
        <h2 className="font-heading font-semibold text-foreground text-lg tracking-tight">
          {title}
        </h2>
        <p className="text-pretty text-muted-foreground text-sm leading-6">
          {description}
        </p>
        {action ? <div className="mt-4">{action}</div> : null}
      </div>
    </section>
  )
}

const GHOST = "rounded-md bg-muted/70"

/** Ghosted card grid — for surfaces that list projects, suppliers, metrics. */
function EmptyStateCards() {
  return (
    <div className="flex w-full max-w-3xl items-start justify-center gap-4">
      {["left", "center", "right"].map((slot) => (
        <div
          key={slot}
          className={cn(
            "flex-1 rounded-xl border border-border bg-card p-4 shadow-xs",
            // The middle card sits forward; the outer two read as context.
            slot === "center" ? "opacity-100" : "opacity-45"
          )}
        >
          <div className="flex items-center gap-2.5">
            <div className={cn(GHOST, "size-8 rounded-full")} />
            <div className="flex-1 space-y-1.5">
              <div className={cn(GHOST, "h-2.5 w-2/3")} />
              <div className={cn(GHOST, "h-2 w-1/2 bg-muted/50")} />
            </div>
          </div>
          <div className={cn(GHOST, "mt-4 h-2.5 w-full")} />
          <div className={cn(GHOST, "mt-2 h-2.5 w-4/5 bg-muted/50")} />
        </div>
      ))}
    </div>
  )
}

/** Ghosted table rows — for surfaces that list records in a table. */
function EmptyStateRows() {
  return (
    <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-border bg-card">
      {["one", "two", "three", "four"].map((row, index) => (
        <div
          key={row}
          className="flex items-center gap-4 border-border/60 border-b p-3.5 last:border-0"
          style={{ opacity: 1 - index * 0.18 }}
        >
          <div className={cn(GHOST, "size-7 rounded-full")} />
          <div className={cn(GHOST, "h-2.5 w-1/3")} />
          <div className={cn(GHOST, "h-2.5 w-1/5 bg-muted/50")} />
          <div className={cn(GHOST, "ml-auto h-2.5 w-12 bg-muted/50")} />
        </div>
      ))}
    </div>
  )
}

export { EmptyState, EmptyStateCards, EmptyStateRows }
