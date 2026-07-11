"use client"

import type { ReactNode } from "react"

import { HugeiconsIcon } from "@hugeicons/react"
import { BellIcon } from "@hugeicons/core-free-icons"

import { Button } from "@workspace/ui/components/button"
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import { SidebarInset, SidebarProvider } from "@workspace/ui/components/sidebar"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet"

import {
  DashboardSidebar,
  DashboardSidebarToggle,
} from "@/components/dashboard/sidebar"

type DashboardShellProps = {
  title: string
  subtitle: string
  dataSource?: "api" | "mock"
  children: ReactNode
}

export function DashboardShell({
  dataSource,
  title,
  children,
}: DashboardShellProps) {
  return (
    <div className="flex min-h-svh w-full bg-sidebar">
      <SidebarProvider className="flex min-h-svh w-full bg-transparent">
        <DashboardSidebar />
        <SidebarInset className="relative z-10 flex min-w-0 flex-1 flex-col rounded-tl-2xl border-t border-l bg-background">
          <DashboardTopbar title={title} dataSource={dataSource} />
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-3 sm:px-7 sm:py-3 lg:px-10 lg:py-4">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}

function DashboardTopbar({
  dataSource,
  title,
}: {
  dataSource?: "api" | "mock"
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
          <h1 className="text-xl leading-6 font-semibold text-foreground">{title}</h1>
        </div>
        {dataSource === "mock" && (
          <p className="text-[10px] font-medium text-warning">
            Showing typed mock data until API credentials are configured.
          </p>
        )}
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
        <Avatar aria-label="Musa Byaruhanga" className="size-8">
          <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
            MB
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
