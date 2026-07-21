import { describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))

import {
  canGrantRole,
  normalizeRole,
  requireRole,
  type WorkspaceRole,
} from "./permissions"

describe("normalizeRole", () => {
  it("normalizes known role strings", () => {
    expect(normalizeRole("owner")).toBe("owner")
    expect(normalizeRole("Owner / Admin")).toBe("owner")
    expect(normalizeRole("admin")).toBe("owner")
    expect(normalizeRole("site_manager")).toBe("site_manager")
    expect(normalizeRole("Site manager")).toBe("site_manager")
    expect(normalizeRole("Accountant")).toBe("accountant")
    expect(normalizeRole("accountant")).toBe("accountant")
    expect(normalizeRole("viewer")).toBe("viewer")
  })

  it("defaults unknown roles to viewer", () => {
    expect(normalizeRole("Owner")).toBe("viewer")
    expect(normalizeRole("OWNER")).toBe("viewer")
    expect(normalizeRole("unknown")).toBe("viewer")
    expect(normalizeRole("")).toBe("viewer")
  })
})

describe("canGrantRole", () => {
  it("owner can grant any role", () => {
    const roles: WorkspaceRole[] = [
      "owner",
      "site_manager",
      "accountant",
      "viewer",
    ]
    for (const target of roles) {
      expect(canGrantRole("owner", target)).toBe(true)
    }
  })

  it("site_manager cannot grant owner", () => {
    expect(canGrantRole("site_manager", "owner")).toBe(false)
  })

  it("site_manager can grant non-owner roles", () => {
    expect(canGrantRole("site_manager", "site_manager")).toBe(true)
    expect(canGrantRole("site_manager", "accountant")).toBe(true)
    expect(canGrantRole("site_manager", "viewer")).toBe(true)
  })

  it("accountant cannot grant owner or site_manager", () => {
    expect(canGrantRole("accountant", "owner")).toBe(false)
    expect(canGrantRole("accountant", "site_manager")).toBe(false)
  })

  it("viewer cannot grant any role", () => {
    const roles: WorkspaceRole[] = [
      "owner",
      "site_manager",
      "accountant",
      "viewer",
    ]
    for (const target of roles) {
      expect(canGrantRole("viewer", target)).toBe(false)
    }
  })
})

describe("requireRole", () => {
  it("does not throw when actor has a sufficient role", () => {
    expect(() => requireRole("owner", ["owner", "site_manager"])).not.toThrow()
    expect(() =>
      requireRole("site_manager", ["owner", "site_manager"])
    ).not.toThrow()
  })

  it("throws forbidden when actor role is not in allowed list", () => {
    expect(() => requireRole("viewer", ["owner", "site_manager"])).toThrow()
    expect(() => requireRole("accountant", ["owner", "site_manager"])).toThrow()
  })
})
