import { describe, expect, it } from "vitest"
import {
  dockLabel,
  dockMoreGroups,
  dockPrimaryNavigation,
  isAdminRouteActive,
  isMoreRouteActive,
  mainNav,
  platformNav,
  settingsNavItem,
} from "@/components/admin-navigation"

// mainNav is used in the "reaches every sidebar destination" test below.

describe("isAdminRouteActive", () => {
  it("matches the exact route", () => {
    expect(isAdminRouteActive("/organizations", "/organizations")).toBe(true)
  })

  it("matches nested detail routes", () => {
    expect(isAdminRouteActive("/organizations/abc123", "/organizations")).toBe(
      true
    )
  })

  it("does not match a sibling route sharing a prefix", () => {
    expect(isAdminRouteActive("/organizations-archive", "/organizations")).toBe(
      false
    )
  })

  it("does not match an unrelated route", () => {
    expect(isAdminRouteActive("/users", "/organizations")).toBe(false)
  })
})

describe("isMoreRouteActive", () => {
  it("is true for a route that only lives in the More sheet", () => {
    expect(isMoreRouteActive("/users/u-1")).toBe(true)
    expect(isMoreRouteActive("/settings")).toBe(true)
  })

  it("is false for routes that have their own dock slot", () => {
    for (const item of dockPrimaryNavigation) {
      expect(isMoreRouteActive(item.href)).toBe(false)
    }
  })
})

describe("dock composition", () => {
  it("fills exactly four slots so the dock stays five columns wide", () => {
    expect(dockPrimaryNavigation).toHaveLength(4)
  })

  it("reaches every sidebar destination from either the dock or the More sheet", () => {
    const reachable = new Set([
      ...dockPrimaryNavigation.map((item) => item.href),
      ...dockMoreGroups.flatMap((group) =>
        group.items.map((item) => item.href)
      ),
    ])

    const sidebarHrefs = [
      ...mainNav,
      ...platformNav,
      settingsNavItem,
    ].map((item) => item.href)

    for (const href of sidebarHrefs) {
      expect(reachable.has(href)).toBe(true)
    }
  })

  it("keeps dock labels short enough for a ~64px slot", () => {
    for (const item of dockPrimaryNavigation) {
      expect(dockLabel(item).length).toBeLessThanOrEqual(9)
    }
  })
})
