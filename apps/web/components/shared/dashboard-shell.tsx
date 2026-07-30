import type { ReactNode } from "react"

/**
 * The content container for a workspace page.
 *
 * The sidebar, topbar and footer that used to live here now sit in
 * WorkspaceChrome, rendered by [workspaceSlug]/layout.tsx, so they persist
 * across navigation instead of unmounting on every route change. Pages own only
 * their content; the topbar derives its title from the route.
 */
export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-7 sm:py-6 md:gap-8 lg:px-10 lg:py-8">
      {children}
    </div>
  )
}
