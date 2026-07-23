"use client"

import {
  LayoutAlignRightIcon,
  Settings02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { type ReactNode } from "react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { Button } from "@workspace/ui/components/button"
import { useSidebar } from "@workspace/ui/components/sidebar"

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
  subtitle,
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
  const initials = getInitials(userName)

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
        <Avatar className="size-8">
          {userImage ? <AvatarImage src={userImage} alt={userName} /> : null}
          <AvatarFallback className="bg-primary font-medium text-primary-foreground text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
