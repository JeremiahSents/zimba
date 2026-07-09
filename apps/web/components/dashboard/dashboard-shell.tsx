"use client"

import type { ReactNode } from "react"

import { HugeiconsIcon } from "@hugeicons/react"
import { BellIcon } from "@hugeicons/core-free-icons"

import { Button } from "@workspace/ui/components/button"
import {
  SidebarInset,
  SidebarProvider,
} from "@workspace/ui/components/sidebar"

import {
  DashboardSidebar,
  DashboardSidebarToggle,
} from "@/components/dashboard/sidebar"

type DashboardShellProps = {
  title: string
  subtitle: string
  children: ReactNode
}

export function DashboardShell({
  title,
  subtitle,
  children,
}: DashboardShellProps) {
  return (
    <div className="flex h-screen w-full bg-sidebar">
      <SidebarProvider className="flex h-full w-full overflow-hidden bg-transparent">
        <DashboardSidebar />
        <SidebarInset className="relative z-10 flex min-w-0 flex-1 flex-col overflow-hidden rounded-tl-[1.5rem] border-l border-t border-black/5 bg-white shadow-[-12px_0_32px_rgba(0,0,0,0.05)]">
          <DashboardTopbar title={title} subtitle={subtitle} />
          <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 overflow-y-auto p-4 sm:p-6 lg:p-8 xl:px-10">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet"

function DashboardTopbar({
  title,
  subtitle,
}: {
  title: string
  subtitle: string
}) {
  return (
    <header className="flex min-h-16 shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-3 bg-white px-4 py-4 sm:px-6 lg:px-8 xl:px-10">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <DashboardSidebarToggle
            aria-label="Toggle dashboard navigation"
            className="size-6 rounded-md hover:bg-muted hover:text-foreground [&_svg]:size-4 -ml-1"
            icon="open"
          />
          <span className="font-medium">Overview</span>
        </div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 self-start mt-8">
        <Sheet>
          <SheetTrigger render={<Button variant="ghost" size="icon" aria-label="View notifications" />}>
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
        <Button size="sm">New expense</Button>
      </div>
    </header>
  )
}

