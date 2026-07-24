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
import { useSidebar } from "@workspace/ui/components/sidebar"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { ReactNode } from "react"
import { authClient } from "@/lib/auth-client"

type AdminDashboardShellProps = {
  title: ReactNode
  subtitle?: string
  headerGreeting?: string
  userName: string
  userImage?: string | null
  children: ReactNode
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

export function AdminDashboardShell({
  title,
  headerGreeting,
  userName,
  userImage,
  children,
}: AdminDashboardShellProps) {
  return (
    <>
      <DashboardTopbar
        title={title}
        headerGreeting={headerGreeting}
        userName={userName}
        userImage={userImage}
      />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-7 sm:py-6 md:gap-8 lg:px-10 lg:py-8">
        {children}
      </div>
    </>
  )
}

function DashboardTopbar({
  title,
  headerGreeting,
  userName,
  userImage,
}: Omit<AdminDashboardShellProps, "children" | "subtitle">) {
  const { toggleSidebar } = useSidebar()
  const router = useRouter()
  const initials = getInitials(userName)

  async function handleSignOut() {
    await authClient.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <header className="flex min-h-14 shrink-0 flex-wrap items-center justify-between gap-3 bg-background px-4 py-2.5 sm:min-h-16 sm:px-7 sm:py-3 md:border-b lg:px-10">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={toggleSidebar}
            aria-label="Toggle dashboard navigation"
            className="-ml-1 hidden size-9 rounded-md hover:bg-muted hover:text-foreground md:inline-flex [&_svg]:size-5"
          >
            <HugeiconsIcon icon={LayoutAlignRightIcon} strokeWidth={2} />
          </Button>
          {headerGreeting ? (
            <div className="flex min-w-0 flex-col">
              <span className="text-muted-foreground text-xs leading-4">
                {headerGreeting}
              </span>
              <h1 className="truncate font-heading font-medium text-foreground text-lg leading-6 tracking-tight">
                {userName.trim().split(/\s+/)[0] || title}
              </h1>
            </div>
          ) : (
            <h1 className="font-heading font-medium text-foreground text-lg leading-6 tracking-tight">
              {title}
            </h1>
          )}
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
        <Menu.Root>
          <Menu.Trigger
            aria-label={`Open account menu for ${userName}`}
            className="rounded-full outline-none ring-offset-background transition-shadow focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Avatar className="size-8">
              {userImage ? <AvatarImage src={userImage} alt={userName} /> : null}
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
