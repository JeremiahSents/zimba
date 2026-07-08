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
    <SidebarProvider className="bg-muted">
      <DashboardSidebar />
      <SidebarInset className="min-w-0 border-l border-border/70 bg-card md:m-3 md:ml-0 md:rounded-l-2xl md:shadow-[0_1px_2px_rgb(15_23_42/0.04),0_16px_48px_rgb(15_23_42/0.06)]">
        <DashboardTopbar title={title} subtitle={subtitle} />
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6 lg:p-8 xl:px-10">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

function DashboardTopbar({
  title,
  subtitle,
}: {
  title: string
  subtitle: string
}) {
  return (
    <header className="sticky top-0 z-10 flex min-h-20 flex-wrap items-center gap-x-4 gap-y-3 border-b border-border/70 bg-card/95 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <DashboardSidebarToggle
          aria-label="Open dashboard navigation"
          className="md:hidden"
          icon="open"
        />
        <div className="flex min-w-0 flex-col gap-0.5 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-3 sm:gap-y-1">
          <h1 className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">
            {title}
          </h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      <div className="ml-auto flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="View notifications"
          className="relative"
        >
          <HugeiconsIcon icon={BellIcon} strokeWidth={2} className="size-4" />
          <span className="absolute right-2.5 top-2.5 size-1.5 rounded-full bg-primary" />
        </Button>
        <Button variant="outline">New project</Button>
        <Button>New expense</Button>
      </div>
    </header>
  )
}
