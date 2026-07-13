"use client"

import { BellIcon, Settings02Icon } from "@hugeicons/core-free-icons"

import { HugeiconsIcon } from "@hugeicons/react"
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"

import { Button } from "@workspace/ui/components/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet"
import { SidebarInset, SidebarProvider } from "@workspace/ui/components/sidebar"
import Link from "next/link"
import type { ReactNode } from "react"

import {
  DashboardSidebar,
  DashboardSidebarToggle,
} from "@/components/shared/sidebar"

type DashboardShellProps = {
  title: string
  subtitle: string
  dataSource?: "api" | "mock"
  headerGreeting?: string
  children: ReactNode
}

export function DashboardShell({
  headerGreeting,
  title,
  children,
}: DashboardShellProps) {
  return (
    <div className="flex min-h-svh w-full bg-sidebar">
      <SidebarProvider className="flex min-h-svh w-full bg-transparent">
        <DashboardSidebar />
        <SidebarInset className="relative z-10 flex min-w-0 flex-1 flex-col border-t border-l bg-background">
          <DashboardTopbar title={title} headerGreeting={headerGreeting} />
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-5 sm:px-7 sm:py-6 lg:px-10 lg:py-8">
            {children}
          </div>
          <footer className="mt-auto border-t px-4 py-4 text-center text-[10px] text-muted-foreground sm:px-7 lg:px-10">
            A product of Sents Holding Company
          </footer>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}

function DashboardTopbar({
  headerGreeting,
  title,
}: {
  headerGreeting?: string
  title: string
}) {
  return (
    <header className="flex min-h-16 shrink-0 flex-wrap items-center justify-between gap-3 border-b bg-background px-4 py-3 sm:px-7 lg:px-10">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-2">
          <DashboardSidebarToggle
            aria-label="Toggle dashboard navigation"
            className="-ml-1 size-6 rounded-md hover:bg-muted hover:text-foreground [&_svg]:size-4"
            icon="open"
          />
          <h1 className="font-heading font-semibold text-foreground text-xl leading-6 tracking-tight">
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
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Notifications</SheetTitle>
              <SheetDescription>
                You have no new notifications.
              </SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
        <Button
          variant="ghost"
          size="icon"
          nativeButton={false}
          render={
            <Link href="/dashboard/settings" aria-label="Open settings" />
          }
        >
          <HugeiconsIcon
            icon={Settings02Icon}
            strokeWidth={2}
            className="size-4"
          />
        </Button>
        <Avatar aria-label="Musa Byaruhanga" className="size-8">
          <AvatarFallback className="bg-primary font-normal text-primary-foreground text-xs">
            MB
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
