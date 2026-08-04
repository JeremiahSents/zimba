"use client"

import { BellIcon, Settings02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@workspace/ui/components/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet"
import { SidebarInset } from "@workspace/ui/components/sidebar"
import { useIsMobile } from "@workspace/ui/hooks/use-mobile"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { type ReactNode, useEffect, useState } from "react"
import {
  buildWorkspaceHref,
  dashboardNavigation,
  getWorkspaceSlug,
} from "@/components/shared/dashboard-navigation"
import { MobileDashboardNav } from "@/components/shared/mobile-dashboard-nav"
import {
  DashboardSidebar,
  DashboardSidebarToggle,
} from "@/components/shared/sidebar"

/**
 * The persistent workspace frame: sidebar, topbar, footer and mobile nav.
 *
 * This lives in the layout rather than in each page so it survives navigation.
 * When it sat inside DashboardShell — which pages render — every route change
 * unmounted the entire app shell and loading.tsx replaced the sidebar too.
 */
export function WorkspaceChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const focusedTask = isFocusedTaskRoute(pathname)

  return (
    <div className="flex min-h-svh w-full bg-sidebar">
      <DashboardSidebar />
      {/*
        No border and no z-index: the content pane is a raised sheet over the
        sidebar plane, and `variant="inset"` on the sidebar is what gives it the
        gutter, rounded corners and shadow. A seam here would flatten the two
        surfaces back into one.
      */}
      <SidebarInset className="flex min-w-0 flex-1 flex-col overflow-hidden bg-background">
        <WorkspaceTopbar />
        {children}
        <footer
          className={`mt-auto px-4 text-center text-[10px] text-muted-foreground sm:px-7 lg:px-10 ${focusedTask ? "py-4" : "pt-4 pb-[calc(var(--mobile-bottom-space)+2rem)] md:py-4"}`}
        >
          Built by Zimba Group Ltd.
        </footer>
      </SidebarInset>
      {!focusedTask ? <MobileDashboardNav /> : null}
    </div>
  )
}

/**
 * Routes that hide the mobile nav and tighten the footer: single-purpose forms
 * where the surrounding navigation is a distraction. Previously the
 * `focusedTask` prop on DashboardShell; derived from the route now that the
 * chrome no longer sees page props.
 */
const FOCUSED_TASK_PATTERNS = [
  /\/projects\/new(\/|$)/,
  /\/projects\/[^/]+\/edit$/,
  /\/projects\/[^/]+\/tasks\/new$/,
  /\/projects\/[^/]+\/expenses\/new$/,
  /\/suppliers\/new$/,
]

function isFocusedTaskRoute(pathname: string) {
  return FOCUSED_TASK_PATTERNS.some((pattern) => pattern.test(pathname))
}

/** Titles for routes that aren't in the sidebar navigation. */
const EXTRA_TITLES: Record<string, string> = {
  expenses: "Expenses",
  budget: "Budget",
  settings: "Settings",
}

const FOCUSED_TITLES: Array<[RegExp, string]> = [
  [/\/projects\/new\/allocation$/, "New project"],
  [/\/projects\/new$/, "New project"],
  [/\/projects\/[^/]+\/edit$/, "Edit project"],
  [/\/projects\/[^/]+\/tasks\/new$/, "New project task"],
  [/\/projects\/[^/]+\/expenses\/new$/, "New receipt"],
  [/\/suppliers\/new$/, "New supplier"],
]

function getPageTitle(pathname: string): string {
  for (const [pattern, title] of FOCUSED_TITLES) {
    if (pattern.test(pathname)) return title
  }
  // Segment after the workspace slug — "/acme/projects/123" → "projects".
  const segment = pathname.split("/").filter(Boolean)[1]
  if (!segment) return "Home"
  const navItem = dashboardNavigation.find((item) => item.segment === segment)
  return navItem?.title ?? EXTRA_TITLES[segment] ?? "Home"
}

function WorkspaceTopbar() {
  const pathname = usePathname()
  const slug = getWorkspaceSlug(pathname) ?? ""
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const isMobile = useIsMobile()

  const title = getPageTitle(pathname)

  useEffect(() => {
    const openNotifications = () => setNotificationsOpen(true)
    window.addEventListener("zimba:open-notifications", openNotifications)
    return () =>
      window.removeEventListener("zimba:open-notifications", openNotifications)
  }, [])

  // A location strip, not a header: it answers "where am I" in a quiet voice
  // and leaves "what is this" to the page's own h1. No bottom border — the
  // sheet's rounded edge is already the separator.
  return (
    <header className="flex min-h-12 shrink-0 flex-wrap items-center justify-between gap-3 bg-background px-4 py-2 sm:min-h-14 sm:px-7 sm:py-2.5 lg:px-10">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <DashboardSidebarToggle
            aria-label="Toggle dashboard navigation"
            className="-ml-1.5 hidden size-8 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground md:inline-flex [&_svg]:size-4"
            icon="open"
          />
          <span className="truncate font-medium text-[13px] text-muted-foreground">
            {title}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Sheet open={notificationsOpen} onOpenChange={setNotificationsOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                aria-label="View notifications"
              />
            }
          >
            <HugeiconsIcon icon={BellIcon} strokeWidth={2} className="size-4" />
          </SheetTrigger>
          <SheetContent
            side={isMobile ? "bottom" : "right"}
            className="max-h-[82dvh] gap-0 overflow-y-auto rounded-t-[28px] sm:max-h-none sm:max-w-md sm:rounded-none"
            overlayClassName="bg-black/35"
          >
            <SheetHeader className="border-b">
              <div className="flex items-start justify-between gap-4 pr-8">
                <div>
                  <SheetTitle>Payment notifications</SheetTitle>
                  <SheetDescription>Payments awaiting review.</SheetDescription>
                </div>
              </div>
            </SheetHeader>
            <div className="p-8 text-center text-muted-foreground text-sm">
              No upcoming payments.
            </div>
          </SheetContent>
        </Sheet>
        <Button
          variant="ghost"
          size="icon"
          className="hidden md:inline-flex"
          nativeButton={false}
          render={
            <Link
              href={buildWorkspaceHref(slug, "settings")}
              aria-label="Open settings"
            />
          }
        >
          <HugeiconsIcon
            icon={Settings02Icon}
            strokeWidth={2}
            className="size-4"
          />
        </Button>
      </div>
    </header>
  )
}
