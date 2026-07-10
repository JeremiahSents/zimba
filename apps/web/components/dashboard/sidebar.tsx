"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ComponentProps } from "react"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  Analytics02Icon,
  DashboardSquare02Icon,
  FolderKanbanIcon,
  Invoice02Icon,
  LayoutAlignLeftIcon,
  LayoutAlignRightIcon,
  MoneyBag02Icon,
  Settings02Icon,
  UserCircleIcon,
  UserGroupIcon,
  Wallet02Icon,
} from "@hugeicons/core-free-icons"

import { Button } from "@workspace/ui/components/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@workspace/ui/components/sidebar"

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: DashboardSquare02Icon },
  { title: "Budget", href: "/dashboard/budget", icon: Wallet02Icon },
  { title: "Projects", href: "/dashboard/projects", icon: FolderKanbanIcon },
  { title: "Expenses", href: "/dashboard/expenses", icon: Invoice02Icon },
  { title: "Suppliers", href: "/dashboard/suppliers", icon: MoneyBag02Icon },
  { title: "Team", href: "/dashboard/team", icon: UserGroupIcon },
  { title: "Reports", href: "/dashboard/reports", icon: Analytics02Icon },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar
      collapsible="icon"
      className="!border-r-0 bg-transparent group-data-[collapsible=icon]:bg-transparent"
    >
      <SidebarHeader className="p-4 pb-3">
        <SidebarBrand />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="px-3 py-1">
          <SidebarGroupLabel className="px-3 pb-2 text-[10px] font-semibold tracking-[0.16em] text-sidebar-foreground/40 uppercase group-data-[collapsible=icon]:hidden">
            Overview
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={
                      item.href === "/dashboard"
                        ? pathname === item.href
                        : pathname.startsWith(item.href)
                    }
                    className="relative h-10 rounded-full px-3 text-[13px] font-medium text-sidebar-foreground/62 transition-colors group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0! hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground data-active:bg-primary/10 data-active:text-primary group-data-[collapsible=icon]:[&_span]:hidden [&_svg]:size-4.5! [&_svg]:text-sidebar-foreground/45 data-active:[&_svg]:text-primary"
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

      <SidebarFooter className="p-3 pt-2">
        <SidebarMenu className="gap-2">
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Settings"
              isActive={pathname.startsWith("/dashboard/settings")}
              className="h-10 rounded-full px-3 text-[13px] font-medium text-sidebar-foreground/62 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0! hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:[&_span]:hidden [&_svg]:size-4.5! [&_svg]:text-sidebar-foreground/45"
              render={
                <Link href="/dashboard/settings">
                  <HugeiconsIcon icon={Settings02Icon} strokeWidth={2} />
                  <span>Settings</span>
                </Link>
              }
            />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Musa Byaruhanga"
              className="mt-1 h-12 rounded-full px-3 text-sidebar-foreground group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0! hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:[&_span]:hidden [&_svg]:size-4.5!"
              render={
                <Link href="/dashboard/settings">
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
      <div className="mx-auto flex size-10 items-center justify-center">
        <Image
          src="/logo-landing.png"
          alt="Zimba logo"
          width={24}
          height={24}
          className="size-6"
        />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
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
          <span className="block truncate font-heading text-lg leading-tight font-semibold text-sidebar-foreground">
            Zimba
          </span>
          <span className="block truncate text-xs font-medium text-muted-foreground">
            Zimba Consultants
          </span>
        </span>
      </Link>
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
