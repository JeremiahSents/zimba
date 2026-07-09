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
    <SidebarProvider className="bg-white">
      <DashboardSidebar />
      <SidebarInset className="min-w-0 bg-white">
        <DashboardTopbar title={title} subtitle={subtitle} />
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6 lg:p-8 xl:px-10">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
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
    <header className="sticky top-0 z-10 flex min-h-16 flex-wrap items-center gap-x-4 gap-y-3 bg-white px-4 py-3 sm:px-6 lg:px-8">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <DashboardSidebarToggle
          aria-label="Open dashboard navigation"
          className="md:hidden"
          icon="open"
        />
        <div className="flex min-w-0 flex-col">
          <h1 className="font-heading text-xl font-semibold tracking-tight">
            {title}
          </h1>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
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

