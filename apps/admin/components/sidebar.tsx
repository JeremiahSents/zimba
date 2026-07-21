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

  return (
    <Sidebar>
      <SidebarHeader className="h-16 flex items-center px-4 border-b">
        <span className="font-bold tracking-tight">Zimba Admin</span>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <Link href={item.href} passHref legacyBehavior>
                    <SidebarMenuButton
                      isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                      tooltip={item.name}
                    >
                      <HugeiconsIcon icon={item.icon} strokeWidth={1.8} className="size-4" />
                      <span>{item.name}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {operationsNav.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <Link href={item.href} passHref legacyBehavior>
                    <SidebarMenuButton
                      isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                      tooltip={item.name}
                    >
                      <HugeiconsIcon icon={item.icon} strokeWidth={1.8} className="size-4" />
                      <span>{item.name}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {platformNav.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <Link href={item.href} passHref legacyBehavior>
                    <SidebarMenuButton
                      isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                      tooltip={item.name}
                    >
                      <HugeiconsIcon icon={item.icon} strokeWidth={1.8} className="size-4" />
                      <span>{item.name}</span>
                    </SidebarMenuButton>
                  </Link>
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
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  tooltip={item.name}
                >
                  <HugeiconsIcon icon={item.icon} strokeWidth={1.8} className="size-4" />
                  <span>{item.name}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
