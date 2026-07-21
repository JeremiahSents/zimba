"use client"

import type { ReactNode } from "react"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar"

const navigation = [
  { title: "Overview", short: "OV", active: true },
  { title: "Organizations", short: "OR", active: false },
  { title: "Users", short: "US", active: false },
  { title: "Roles", short: "RL", active: false },
  { title: "Billing", short: "BL", active: false },
  { title: "Audit logs", short: "AU", active: false },
  { title: "Settings", short: "SE", active: false },
]

const operations = [
  { title: "Approval queue", short: "AP", active: false },
  { title: "Feature flags", short: "FF", active: false },
  { title: "System health", short: "SH", active: false },
]

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="icon" className="border-r bg-sidebar">
        <SidebarHeader className="p-4 pb-3 group-data-[collapsible=icon]:px-0">
          <div className="space-y-3">
            <div className="flex items-center gap-3 px-2">
              <div className="grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                <span className="font-heading text-sm font-semibold tracking-[0.2em]">A</span>
              </div>
              <div className="min-w-0">
                <p className="truncate font-heading text-lg font-semibold leading-tight text-sidebar-foreground">
                  Zimba Admin
                </p>
                <p className="text-xs text-sidebar-foreground/60">
                  Super admin control plane
                </p>
              </div>
            </div>
            <div className="px-2">
              <Input
                className="h-10 border-sidebar-border bg-sidebar-accent/25 text-sidebar-foreground placeholder:text-sidebar-foreground/40"
                placeholder="Search platform data"
              />
            </div>
          </div>
        </SidebarHeader>

        <SidebarSeparator />

        <SidebarContent>
          <SidebarGroup className="px-3 py-1 group-data-[collapsible=icon]:px-0">
            <SidebarGroupLabel className="px-3 pb-2 text-[11px] font-semibold text-sidebar-foreground/55 group-data-[collapsible=icon]:hidden">
              Navigation
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1.5">
                {navigation.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={item.active}
                      tooltip={item.title}
                      className="h-10 rounded-xl px-3 font-medium text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-active:bg-primary/10 data-active:text-primary group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:grid group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:place-items-center group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:[&_span:last-child]:hidden [&_svg]:size-4! [&_svg]:text-sidebar-foreground/45 data-active:[&_svg]:text-primary"
                      render={
                        <button type="button">
                          <span className="grid size-6 place-items-center rounded-lg bg-sidebar-accent/80 text-[10px] font-semibold tracking-[0.2em] text-sidebar-foreground/65">
                            {item.short}
                          </span>
                          <span>{item.title}</span>
                        </button>
                      }
                    />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="px-3 py-1 group-data-[collapsible=icon]:px-0">
            <SidebarGroupLabel className="px-3 pb-2 text-[11px] font-semibold text-sidebar-foreground/55 group-data-[collapsible=icon]:hidden">
              Operations
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1.5">
                {operations.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={item.active}
                      tooltip={item.title}
                      className="h-10 rounded-xl px-3 font-medium text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-active:bg-primary/10 data-active:text-primary group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:grid group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:place-items-center group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:[&_span:last-child]:hidden [&_svg]:size-4! [&_svg]:text-sidebar-foreground/45 data-active:[&_svg]:text-primary"
                      render={
                        <button type="button">
                          <span className="grid size-6 place-items-center rounded-lg bg-sidebar-accent/80 text-[10px] font-semibold tracking-[0.2em] text-sidebar-foreground/65">
                            {item.short}
                          </span>
                          <span>{item.title}</span>
                        </button>
                      }
                    />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-3 pt-2 group-data-[collapsible=icon]:px-0">
          <div className="rounded-2xl border border-sidebar-border bg-sidebar-accent/35 p-3 text-sidebar-foreground shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-xs font-medium">System status</p>
                <p className="mt-0.5 text-[11px] text-sidebar-foreground/55">
                  All core services are healthy
                </p>
              </div>
              <Badge variant="success" className="shrink-0">
                Healthy
              </Badge>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="bg-background">
        <div className="flex min-h-svh flex-col">
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur lg:px-6">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div className="min-w-0">
                <p className="font-heading text-base font-semibold tracking-tight">
                  Super admin dashboard
                </p>
                <p className="text-xs text-muted-foreground">
                  Monitor the platform from one control surface
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="hidden sm:inline-flex">
                Production
              </Badge>
              <Button variant="secondary" size="sm">
                Export
              </Button>
              <Button size="sm">New org</Button>
            </div>
          </header>

          <main className="flex-1 p-4 lg:p-6">{children}</main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
