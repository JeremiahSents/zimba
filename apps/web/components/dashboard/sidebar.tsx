"use client"

import Image from "next/image"
import Link from "next/link"
import type { ComponentProps } from "react"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  Analytics02Icon,
  DashboardSquare02Icon,
  Invoice02Icon,
  LayoutAlignLeftIcon,
  LayoutAlignRightIcon,
  MoneyBag02Icon,
  Settings02Icon,
  UserCircleIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"

import { Button } from "@workspace/ui/components/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@workspace/ui/components/sidebar"

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: DashboardSquare02Icon, active: true },
  { title: "Expenses", href: "#", icon: Invoice02Icon },
  { title: "Suppliers", href: "#", icon: MoneyBag02Icon },
  { title: "Team", href: "#", icon: UserGroupIcon },
  { title: "Reports", href: "#", icon: Analytics02Icon },
]

export function DashboardSidebar() {
  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="p-4">
        <SidebarBrand />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="px-3">
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={item.active}
                    className="h-11 rounded-2xl px-3 text-sidebar-foreground/70 data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground data-active:shadow-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-11! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:[&_span]:hidden [&_svg]:size-5! data-active:[&_svg]:text-primary"
                    render={
                      <Link href={item.href}>
                        <HugeiconsIcon icon={item.icon} strokeWidth={2} />
                        <span>{item.title}</span>
                      </Link>
                    }
                  />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <SidebarMenu className="gap-1.5">
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Settings"
              className="h-11 rounded-2xl px-3 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-11! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:[&_span]:hidden [&_svg]:size-5!"
              render={
                <Link href="#">
                  <HugeiconsIcon icon={Settings02Icon} strokeWidth={2} />
                  <span>Settings</span>
                </Link>
              }
            />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Musa Byaruhanga"
              className="h-11 rounded-2xl px-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-11! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:[&_span]:hidden [&_svg]:size-5!"
              render={
                <Link href="#">
                  <HugeiconsIcon icon={UserCircleIcon} strokeWidth={2} />
                  <span className="flex min-w-0 flex-col leading-tight">
                    <span className="truncate text-sm font-medium">
                      Musa Byaruhanga
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      Owner / Admin
                    </span>
                  </span>
                </Link>
              }
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

function SidebarBrand() {
  const { state } = useSidebar()
  const collapsed = state === "collapsed"

  if (collapsed) {
    return (
      <DashboardSidebarToggle
        aria-label="Open sidebar"
        className="mx-auto size-11 rounded-2xl text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground [&_svg]:size-5!"
        icon="open"
      />
    )
  }

  return (
    <div className="flex items-center justify-between gap-2">
      <Link href="/" className="flex min-w-0 items-center gap-3">
        <span className="grid size-10 place-items-center">
          <Image
            src="/logo-landing.png"
            alt="Zimba logo"
            width={24}
            height={24}
            className="size-6"
          />
        </span>
        <span className="min-w-0">
          <span className="block truncate font-heading text-lg font-semibold leading-tight text-sidebar-foreground">
            Zimba
          </span>
          <span className="block truncate text-xs font-medium text-muted-foreground">
            Zimba Consultants
          </span>
        </span>
      </Link>
      <DashboardSidebarToggle
        aria-label="Close sidebar"
        className="size-8 rounded-xl text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        icon="close"
      />
    </div>
  )
}

export function DashboardSidebarToggle({
  className,
  icon,
  ...props
}: ComponentProps<typeof Button> & {
  icon: "open" | "close"
}) {
  const { toggleSidebar } = useSidebar()

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={toggleSidebar}
      className={className}
      {...props}
    >
      <HugeiconsIcon
        icon={icon === "open" ? LayoutAlignRightIcon : LayoutAlignLeftIcon}
        strokeWidth={2}
      />
      <span className="sr-only">Toggle sidebar</span>
    </Button>
  )
}
