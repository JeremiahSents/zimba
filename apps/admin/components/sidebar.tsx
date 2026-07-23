"use client"

import {
  Activity01Icon,
  Alert01Icon,
  BanknoteIcon,
  Building03Icon,
  CreditCardIcon,
  DashboardSquare02Icon,
  FactoryIcon,
  HeadphonesIcon,
  Invoice01Icon,
  Settings02Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
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
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

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

const menuButtonClassName =
  "relative h-10 rounded-md px-3 font-medium text-[13px] text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-active:bg-primary/10 data-active:text-primary group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:grid group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:place-items-center group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:[&_span]:hidden [&_svg]:size-4! [&_svg]:text-sidebar-foreground/50 data-active:[&_svg]:text-primary"

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function SuperAdminSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar
      collapsible="icon"
      className="!border-r-0 bg-transparent group-data-[collapsible=icon]:bg-transparent"
    >
      <SidebarHeader className="p-4 pb-3 group-data-[collapsible=icon]:px-0">
        <SidebarBrand />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="px-3 py-1 group-data-[collapsible=icon]:px-0">
          <SidebarGroupLabel className="px-3 pb-2 font-semibold text-[11px] text-sidebar-foreground/55 group-data-[collapsible=icon]:hidden">
            Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    tooltip={item.name}
                    isActive={isActive(pathname, item.href)}
                    className={menuButtonClassName}
                    render={
                      <Link href={item.href}>
                        <HugeiconsIcon icon={item.icon} strokeWidth={2} />
                        <span>{item.name}</span>
                      </Link>
                    }
                  />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="px-3 py-1 group-data-[collapsible=icon]:px-0">
          <SidebarGroupLabel className="px-3 pb-2 font-semibold text-[11px] text-sidebar-foreground/55 group-data-[collapsible=icon]:hidden">
            Operations
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {operationsNav.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    tooltip={item.name}
                    isActive={isActive(pathname, item.href)}
                    className={menuButtonClassName}
                    render={
                      <Link href={item.href}>
                        <HugeiconsIcon icon={item.icon} strokeWidth={2} />
                        <span>{item.name}</span>
                      </Link>
                    }
                  />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="px-3 py-1 group-data-[collapsible=icon]:px-0">
          <SidebarGroupLabel className="px-3 pb-2 font-semibold text-[11px] text-sidebar-foreground/55 group-data-[collapsible=icon]:hidden">
            Platform
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {platformNav.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    tooltip={item.name}
                    isActive={isActive(pathname, item.href)}
                    className={menuButtonClassName}
                    render={
                      <Link href={item.href}>
                        <HugeiconsIcon icon={item.icon} strokeWidth={2} />
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

      <SidebarFooter className="p-3 pt-2 group-data-[collapsible=icon]:px-0">
        <SidebarMenu className="gap-2">
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Settings"
              isActive={isActive(pathname, "/settings")}
              className={menuButtonClassName}
              render={
                <Link href="/settings">
                  <HugeiconsIcon icon={Settings02Icon} strokeWidth={2} />
                  <span>Settings</span>
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
          className="size-5 object-contain"
        />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Link href="/overview" className="flex min-w-0 items-center gap-3">
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
          <span className="block truncate font-heading font-medium text-lg text-sidebar-foreground leading-tight tracking-tight">
            Zimba Admin
          </span>
        </span>
      </Link>
    </div>
  )
}
