"use client"

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
} from "@workspace/ui/components/sidebar"
import {
  Activity01Icon,
  Alert01Icon,
  Building03Icon,
  CreditCardIcon,
  DashboardSquare02Icon,
  HeadphonesIcon,
  Settings02Icon,
  UserGroupIcon,
  Invoice01Icon,
  BanknoteIcon,
  FactoryIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { useSidebar } from "@workspace/ui/components/sidebar"
import { Button } from "@workspace/ui/components/button"
import { LayoutAlignLeftIcon, LayoutAlignRightIcon } from "@hugeicons/core-free-icons"

export function SuperAdminSidebar() {
  const pathname = usePathname()

  const mainNav = [
    { name: "Overview", href: "/overview", icon: DashboardSquare02Icon },
    { name: "Organizations", href: "/organizations", icon: Building03Icon },
    { name: "Users", href: "/users", icon: UserGroupIcon },
  ]

  const operationsNav = [
    { name: "Projects", href: "/projects", icon: FactoryIcon },
    { name: "Suppliers", href: "/suppliers", icon: UserGroupIcon },
    { name: "Receipts", href: "/receipts", icon: Invoice01Icon },
    { name: "Payments", href: "/payments", icon: BanknoteIcon },
  ]

  const platformNav = [
    { name: "Billing", href: "/billing", icon: CreditCardIcon },
    { name: "Support", href: "/support", icon: HeadphonesIcon },
    { name: "Activity Log", href: "/activity", icon: Activity01Icon },
    { name: "System Health", href: "/system", icon: Alert01Icon },
  ]

  const bottomNav = [
    { name: "Settings", href: "/settings", icon: Settings02Icon },
  ]

  const { state, toggleSidebar } = useSidebar()
  const collapsed = state === "collapsed"

  return (
    <Sidebar
      collapsible="icon"
      className="!border-r-0 bg-transparent group-data-[collapsible=icon]:bg-transparent"
    >
      <SidebarHeader className="p-4 pb-3 group-data-[collapsible=icon]:px-0 flex flex-row items-center justify-between">
        {!collapsed ? (
          <Link href="/overview" className="flex min-w-0 items-center gap-3">
            <span className="grid size-10 place-items-center bg-primary/10 rounded-md text-primary">
              <span className="font-heading font-bold text-xl tracking-tighter leading-none">Z</span>
            </span>
            <span className="min-w-0">
              <span className="block truncate font-heading font-medium text-lg text-sidebar-foreground leading-tight tracking-tight">
                Zimba Admin
              </span>
            </span>
          </Link>
        ) : (
          <div className="mx-auto flex size-10 items-center justify-center bg-primary/10 rounded-md text-primary">
            <span className="font-heading font-bold text-xl tracking-tighter leading-none">Z</span>
          </div>
        )}
        
        {!collapsed && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={toggleSidebar}
            className="h-8 w-8 text-muted-foreground"
          >
            <HugeiconsIcon icon={LayoutAlignLeftIcon} strokeWidth={2} />
          </Button>
        )}
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 pb-2 font-semibold text-[11px] text-sidebar-foreground/55 group-data-[collapsible=icon]:hidden">Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                    tooltip={item.name}
                    render={
                      <Link href={item.href}>
                        <HugeiconsIcon icon={item.icon} strokeWidth={1.8} className="size-4" />
                        <span>{item.name}</span>
                      </Link>
                    }
                  />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-3 pb-2 font-semibold text-[11px] text-sidebar-foreground/55 group-data-[collapsible=icon]:hidden">Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {operationsNav.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                    tooltip={item.name}
                    render={
                      <Link href={item.href}>
                        <HugeiconsIcon icon={item.icon} strokeWidth={1.8} className="size-4" />
                        <span>{item.name}</span>
                      </Link>
                    }
                  />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-3 pb-2 font-semibold text-[11px] text-sidebar-foreground/55 group-data-[collapsible=icon]:hidden">Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {platformNav.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                    tooltip={item.name}
                    render={
                      <Link href={item.href}>
                        <HugeiconsIcon icon={item.icon} strokeWidth={1.8} className="size-4" />
                        <span>{item.name}</span>
                      </Link>
                    }
                  />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {bottomNav.map((item) => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton
                isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                tooltip={item.name}
                className="relative h-10 rounded-md px-3 font-medium text-[13px] text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-active:bg-primary/10 data-active:text-primary group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:grid group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:place-items-center group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:[&_span]:hidden [&_svg]:size-4! [&_svg]:text-sidebar-foreground/50 data-active:[&_svg]:text-primary"
                render={
                  <Link href={item.href}>
                    <HugeiconsIcon icon={item.icon} strokeWidth={1.8} className="size-4" />
                    <span>{item.name}</span>
                  </Link>
                }
              />
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
