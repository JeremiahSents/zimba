import type { ReactNode } from "react"

/**
 * The content container for a workspace page.
 *
 * The sidebar, topbar and footer that used to live here now sit in
 * WorkspaceChrome, rendered by [workspaceSlug]/layout.tsx, so they persist
 * across navigation instead of unmounting on every route change.
 *
 * Pages own their own title. The topbar carries only a quiet location label —
 * two tiers, so "where am I" and "what is this" stop competing for the same
 * line. Pages that need no heading simply omit `title`.
 */
export function DashboardShell({
  title,
  description,
  action,
  children,
}: {
  title?: ReactNode
  description?: ReactNode
  /** Sits opposite the title — primary action for the page. */
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-7 sm:py-6 md:gap-8 lg:px-10 lg:py-8">
      {title ? (
        <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
          <div className="min-w-0">
            <h1 className="font-heading font-semibold text-2xl text-foreground leading-tight tracking-tight sm:text-[28px]">
              {title}
            </h1>
            {description ? (
              <p className="mt-1.5 max-w-2xl text-muted-foreground text-sm leading-relaxed">
                {description}
              </p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </header>
      ) : null}
      {children}
    </div>
  )
}
