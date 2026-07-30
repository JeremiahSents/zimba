import {
  Analytics02Icon,
  DashboardSquare02Icon,
  FolderKanbanIcon,
  MoneyBag02Icon,
  UserGroupIcon,
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
  { title: "Analytics", segment: "analytics", icon: Analytics02Icon },
  { title: "Reports", segment: "reports", icon: Analytics02Icon },
  { title: "Team", segment: "team", icon: UserGroupIcon },
] as const

// Listed explicitly rather than sliced off dashboardNavigation: the mobile bar
// holds four destinations and Team is one of them, even though it sits last in
// the sidebar.
export const mobilePrimaryNavigation: readonly NavSegment[] = [
  "home",
  "projects",
  "suppliers",
  "team",
].map((segment) => {
  const item = dashboardNavigation.find((nav) => nav.segment === segment)
  if (!item) throw new Error(`Unknown mobile nav segment: ${segment}`)
  return item
})

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
