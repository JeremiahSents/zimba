"use client"

import { Menu } from "@base-ui/react/menu"
import {
  LayoutAlignRightIcon,
  Logout03Icon,
  Settings02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { Button } from "@workspace/ui/components/button"
import {
  SidebarInset,
  SidebarProvider,
  useSidebar,
} from "@workspace/ui/components/sidebar"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { type ReactNode } from "react"
import { AdminBreadcrumbs, BreadcrumbProvider } from "@/components/breadcrumb-context"
import { MobileAdminNav } from "@/components/mobile-admin-nav"
import {
  type AdminSidebarUser,
  SuperAdminSidebar,
} from "@/components/sidebar"
import { authClient } from "@/lib/auth-client"

/**
 * The persistent admin frame: sidebar, topbar, and mobile nav. Modeled on the
 * web app's WorkspaceChrome — the sidebar is `variant="inset"` so the content
 * pane reads as a raised sheet, and the topbar is a quiet location strip that
 * leaves "what is this" to each page's own h1 (rendered via AdminDashboardShell).
 *
 * Lives in the layout so it survives navigation; putting it in a page would
 * unmount the whole shell on every route change.
 */
export function AdminChrome({
  user,
  defaultOpen,
  children,
}: {
  user: AdminSidebarUser
  defaultOpen: boolean
  children: ReactNode
}) {
  return (
    <div className="flex min-h-dvh bg-sidebar">
      <SidebarProvider defaultOpen={defaultOpen}>
        <BreadcrumbProvider>
          <SuperAdminSidebar user={user} />
          <SidebarInset className="flex w-full min-w-0 flex-col overflow-hidden bg-background pb-[calc(var(--mobile-bottom-space)+1rem)] md:pb-0">
            <AdminTopbar userName={user.name} userImage={user.image} />
            {children}
          </SidebarInset>
          <MobileAdminNav />
        </BreadcrumbProvider>
      </SidebarProvider>
    </div>
  )
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

function getPageTitle(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean)
  if (segments.length === 0 || segments[0] === "overview") {
    return "Overview"
  }

  const root = segments[0] ?? "overview"
  const isDetail = segments.length > 1

  switch (root) {
    case "organizations":
      return isDetail ? "Organization Details" : "Organizations"
    case "users":
      return isDetail ? "User Details" : "Users"
    case "applications":
      return isDetail ? "Application Details" : "Applications"
    case "transfers":
      return "Applications"
    case "activity":
      return "Activity log"
    case "system":
      return "System"
    case "settings":
      return "Settings"
    default: {
      return root.charAt(0).toUpperCase() + root.slice(1).replace(/-/g, " ")
    }
  }
}

function AdminTopbar({
  userName,
  userImage,
}: {
  userName: string
  userImage: string | null
}) {
  const { toggleSidebar } = useSidebar()
  const router = useRouter()
  const pathname = usePathname()
  const initials = getInitials(userName)
  const title = getPageTitle(pathname)

  async function handleSignOut() {
    await authClient.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <header className="flex min-h-12 shrink-0 flex-wrap items-center justify-between gap-3 bg-background px-4 py-2 sm:min-h-14 sm:px-7 sm:py-2.5 lg:px-10">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={toggleSidebar}
            aria-label="Toggle dashboard navigation"
            className="-ml-1 hidden size-8 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground md:inline-flex [&_svg]:size-4"
          >
            <HugeiconsIcon icon={LayoutAlignRightIcon} strokeWidth={2} />
          </Button>
          <AdminBreadcrumbs />
          <span className="truncate text-[13px] font-medium text-muted-foreground md:hidden">
            {title}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="hidden md:inline-flex"
          nativeButton={false}
          render={<Link href="/settings" aria-label="Open settings" />}
        >
          <HugeiconsIcon
            icon={Settings02Icon}
            strokeWidth={2}
            className="size-4"
          />
        </Button>
        {/* The sidebar footer owns the account menu on md+. The sidebar sheet
            is unreachable below md (its toggle is desktop-only), so the topbar
            keeps an avatar there to preserve access to sign out. */}
        <Menu.Root>
          <Menu.Trigger
            aria-label={`Open account menu for ${userName}`}
            className="rounded-full outline-none ring-offset-background transition-shadow focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:hidden"
          >
            <Avatar className="size-8">
              {userImage ? (
                <AvatarImage src={userImage} alt={userName} />
              ) : null}
              <AvatarFallback className="bg-primary font-medium text-primary-foreground text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Menu.Trigger>
          <Menu.Portal>
            <Menu.Positioner
              align="end"
              side="bottom"
              sideOffset={8}
              className="isolate z-50 outline-none"
            >
              <Menu.Popup className="min-w-44 origin-(--transform-origin) rounded-lg border bg-popover p-1 text-popover-foreground shadow-md outline-none transition data-ending-style:scale-95 data-starting-style:scale-95 data-ending-style:opacity-0 data-starting-style:opacity-0">
                <div className="border-b px-2.5 py-2">
                  <p className="font-medium text-xs">{userName}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    Admin Dashboard
                  </p>
                </div>
                <Menu.Item
                  closeOnClick
                  onClick={handleSignOut}
                  className="mt-1 flex cursor-default items-center gap-2 rounded-md px-2.5 py-2 font-medium text-xs outline-none transition-colors data-highlighted:bg-accent data-highlighted:text-accent-foreground"
                >
                  <HugeiconsIcon
                    icon={Logout03Icon}
                    strokeWidth={1.8}
                    className="size-4"
                  />
                  Sign out
                </Menu.Item>
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>
      </div>
    </header>
  )
}
