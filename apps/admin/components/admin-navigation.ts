import {
  Activity01Icon,
  Alert01Icon,
  BanknoteIcon,
  Building03Icon,
  CreditCardIcon,
  DashboardSquare02Icon,
  FactoryIcon,
  FileCheckIcon,
  HeadphonesIcon,
  Invoice01Icon,
  Settings02Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"

export type AdminNavItem = {
  /** Label used in the sidebar and the "More" sheet. */
  name: string
  /** Shorter label for the mobile dock, where a slot is ~64px wide. */
  dockName?: string
  href: string
  icon: typeof DashboardSquare02Icon
}

export const managementNav: readonly AdminNavItem[] = [
  {
    name: "Overview",
    href: "/overview",
    icon: DashboardSquare02Icon,
  },
  {
    name: "Organizations",
    dockName: "Orgs",
    href: "/organizations",
    icon: Building03Icon,
  },
  { name: "Users", href: "/users", icon: UserGroupIcon },
  {
    name: "Applications & Transfers",
    dockName: "Requests",
    href: "/applications",
    icon: FileCheckIcon,
  },
] as const

export const operationsNav: readonly AdminNavItem[] = [
  { name: "Projects", href: "/projects", icon: FactoryIcon },
  { name: "Suppliers", href: "/suppliers", icon: UserGroupIcon },
  { name: "Receipts", href: "/receipts", icon: Invoice01Icon },
  { name: "Payments", href: "/payments", icon: BanknoteIcon },
] as const

export const platformNav: readonly AdminNavItem[] = [
  { name: "Billing", href: "/billing", icon: CreditCardIcon },
  { name: "Support", href: "/support", icon: HeadphonesIcon },
  { name: "Activity Log", href: "/activity", icon: Activity01Icon },
  { name: "System Health", href: "/system", icon: Alert01Icon },
] as const

export const settingsNavItem: AdminNavItem = {
  name: "Settings",
  href: "/settings",
  icon: Settings02Icon,
}

/**
 * The four destinations that get a permanent slot in the mobile dock. The
 * remaining nine live behind the dock's "More" button.
 */
export const dockPrimaryNavigation = managementNav

export const dockMoreGroups: readonly {
  label: string
  items: readonly AdminNavItem[]
}[] = [
  { label: "Operations", items: operationsNav },
  { label: "Platform", items: platformNav },
  { label: "Account", items: [settingsNavItem] },
] as const

export function isAdminRouteActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

/** True when the current route is reachable only from the "More" sheet. */
export function isMoreRouteActive(pathname: string) {
  return dockMoreGroups.some((group) =>
    group.items.some((item) => isAdminRouteActive(pathname, item.href))
  )
}

export function dockLabel(item: AdminNavItem) {
  return item.dockName ?? item.name
}
