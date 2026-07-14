"use client"

import { Menu } from "@base-ui/react/menu"
import {
  BellIcon,
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet"
import { SidebarInset } from "@workspace/ui/components/sidebar"
import Link from "next/link"
import type { ReactNode } from "react"
import {
  DashboardSidebar,
  DashboardSidebarToggle,
} from "@/components/shared/sidebar"
import {
  formatRole,
  getInitials,
  useWorkspace,
} from "@/components/shared/workspace-provider"
import { formatCurrency, formatShortDate } from "@/lib/format"

type DashboardShellProps = {
  title: string
  subtitle: string
  dataSource?: "api" | "mock"
  headerGreeting?: string
  notifications?: NotificationItem[]
  onAddNotification?: () => void
  children: ReactNode
}

export type NotificationItem = {
  id: number
  name: string
  contractor: string
  item: string
  date: string
  amount: number
}

export function DashboardShell({
  headerGreeting,
  title,
  notifications = [],
  onAddNotification,
  children,
}: DashboardShellProps) {
  return (
    <div className="flex min-h-svh w-full bg-sidebar">
      <DashboardSidebar />
      <SidebarInset className="relative z-10 flex min-w-0 flex-1 flex-col border-t border-l bg-background">
        <DashboardTopbar
          title={title}
          headerGreeting={headerGreeting}
          notifications={notifications}
          onAddNotification={onAddNotification}
        />
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-5 sm:px-7 sm:py-6 lg:px-10 lg:py-8">
          {children}
        </div>
        <footer className="mt-auto border-t px-4 py-4 text-center text-[10px] text-muted-foreground sm:px-7 lg:px-10">
          A product of Sents Holding Company
        </footer>
      </SidebarInset>
    </div>
  )
}

function DashboardTopbar({
  headerGreeting,
  title,
  notifications,
  onAddNotification,
}: {
  headerGreeting?: string
  title: string
  notifications: NotificationItem[]
  onAddNotification?: () => void
}) {
  const user = useWorkspace()
  const initials = getInitials(user.name)

  return (
    <header className="flex min-h-16 shrink-0 flex-wrap items-center justify-between gap-3 border-b bg-background px-4 py-3 sm:px-7 lg:px-10">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-2">
          <DashboardSidebarToggle
            aria-label="Toggle dashboard navigation"
            className="-ml-1 size-9 rounded-md hover:bg-muted hover:text-foreground [&_svg]:size-5"
            icon="open"
          />
          <h1 className="font-heading font-medium text-foreground text-lg leading-6 tracking-tight">
            {headerGreeting ?? title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Sheet>
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
          <SheetContent className="gap-0 sm:max-w-md">
            <SheetHeader className="border-b">
              <div className="flex items-start justify-between gap-4 pr-8">
                <div>
                  <SheetTitle>Payment notifications</SheetTitle>
                  <SheetDescription>Payments awaiting review.</SheetDescription>
                </div>
                {onAddNotification && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 shrink-0 rounded-lg border-primary bg-primary text-primary-foreground hover:bg-primary/85 hover:text-primary-foreground"
                    onClick={onAddNotification}
                    aria-label="Add upcoming payment"
                  >
                    +
                  </Button>
                )}
              </div>
            </SheetHeader>
            <div className="flex flex-col divide-y divide-border">
              {notifications.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 px-6 py-5 transition-colors hover:bg-muted/40"
                >
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-amber-500" />
                  <div className="min-w-0 flex-1">
                    <span className="block font-semibold text-sm">
                      {item.name}
                    </span>
                    <p className="mt-1 text-muted-foreground text-xs leading-5">
                      {item.contractor} · {item.item}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="block text-muted-foreground text-xs">
                      Due {formatShortDate(item.date)}
                    </span>
                    <span className="mt-1 block font-semibold text-foreground text-sm">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  No upcoming payments.
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
        <Button
          variant="ghost"
          size="icon"
          nativeButton={false}
          render={<Link href="/admin/settings" aria-label="Open settings" />}
        >
          <HugeiconsIcon
            icon={Settings02Icon}
            strokeWidth={2}
            className="size-4"
          />
        </Button>
        <Menu.Root>
          <Menu.Trigger
            aria-label={`Open account menu for ${user.name}`}
            className="rounded-full outline-none ring-offset-background transition-shadow focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Avatar className="size-8">
              {user.image ? (
                <AvatarImage src={user.image} alt={user.name} />
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
                  <p className="font-medium text-xs">{user.name}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {formatRole(user.role)} · {user.organizationName}
                  </p>
                </div>
                <Menu.LinkItem
                  closeOnClick
                  render={<Link href="/login" />}
                  className="mt-1 flex cursor-default items-center gap-2 rounded-md px-2.5 py-2 font-medium text-xs outline-none transition-colors data-highlighted:bg-accent data-highlighted:text-accent-foreground"
                >
                  <HugeiconsIcon
                    icon={Logout03Icon}
                    strokeWidth={1.8}
                    className="size-4"
                  />
                  Sign out
                </Menu.LinkItem>
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>
      </div>
    </header>
  )
}
