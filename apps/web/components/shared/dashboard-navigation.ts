import {
  Analytics02Icon,
  DashboardSquare02Icon,
  FolderKanbanIcon,
  MoneyBag02Icon,
  Settings02Icon,
  UserGroupIcon,
  Wallet02Icon,
} from "@hugeicons/core-free-icons"

export const dashboardNavigation = [
  { title: "Home", href: "/admin/home", icon: DashboardSquare02Icon },
  { title: "Projects", href: "/admin/projects", icon: FolderKanbanIcon },
  { title: "Suppliers", href: "/admin/suppliers", icon: MoneyBag02Icon },
  { title: "Team", href: "/admin/team", icon: UserGroupIcon },
  { title: "Analytics", href: "/admin/analytics", icon: Analytics02Icon },
  { title: "Reports", href: "/admin/reports", icon: Analytics02Icon },
] as const

export const mobilePrimaryNavigation = dashboardNavigation.slice(0, 4)

export const mobileMoreNavigation = [
  dashboardNavigation[4],
  dashboardNavigation[5],
  { title: "Expenses", href: "/admin/expenses", icon: MoneyBag02Icon },
  { title: "Budget", href: "/admin/budget", icon: Wallet02Icon },
  { title: "Settings", href: "/admin/settings", icon: Settings02Icon },
] as const

export function isDashboardRouteActive(pathname: string, href: string) {
  if (href === "/admin/home") return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function isMobileMoreRoute(pathname: string) {
  return mobileMoreNavigation.some((item) =>
    isDashboardRouteActive(pathname, item.href)
  )
}
