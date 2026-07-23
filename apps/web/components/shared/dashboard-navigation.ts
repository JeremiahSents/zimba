import {
  Analytics02Icon,
  DashboardSquare02Icon,
  FolderKanbanIcon,
  MoneyBag02Icon,
  Settings02Icon,
  UserGroupIcon,
  Wallet02Icon,
} from "@hugeicons/core-free-icons"

type NavSegment = {
  title: string
  segment: string
  icon: typeof DashboardSquare02Icon
}

export const dashboardNavigation: readonly NavSegment[] = [
  { title: "Home", segment: "home", icon: DashboardSquare02Icon },
  { title: "Projects", segment: "projects", icon: FolderKanbanIcon },
  { title: "Suppliers", segment: "suppliers", icon: MoneyBag02Icon },
  { title: "Team", segment: "team", icon: UserGroupIcon },
  { title: "Analytics", segment: "analytics", icon: Analytics02Icon },
  { title: "Reports", segment: "reports", icon: Analytics02Icon },
] as const

export const mobilePrimaryNavigation = dashboardNavigation.slice(0, 4)

export const mobileMoreNavigation: readonly NavSegment[] = [
  { title: "Analytics", segment: "analytics", icon: Analytics02Icon },
  { title: "Reports", segment: "reports", icon: Analytics02Icon },
  { title: "Budget", segment: "budget", icon: Wallet02Icon },
  { title: "Settings", segment: "settings", icon: Settings02Icon },
] as const

export function getWorkspaceSlug(pathname: string): string | null {
  const match = pathname.match(/^\/([^/]+)/)
  const segment = match?.[1]
  if (!segment) return null
  if (["login", "register", "onboarding", "invite", "api"].includes(segment))
    return null
  return segment
}

export function buildWorkspaceHref(slug: string, segment: string): string {
  return `/${slug}/${segment}`
}

export function isDashboardRouteActive(
  pathname: string,
  slug: string,
  segment: string
) {
  const href = buildWorkspaceHref(slug, segment)
  if (segment === "home") return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function isMobileMoreRoute(pathname: string, slug: string) {
  return mobileMoreNavigation.some((item) =>
    isDashboardRouteActive(pathname, slug, item.segment)
  )
}
