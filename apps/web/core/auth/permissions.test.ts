import { describe, expect, it } from "vitest"
import {
  canGrantRole,
  normalizeRole,
  requireRole,
  type WorkspaceRole,
} from "./permissions"

describe("normalizeRole", () => {
  it("normalizes owner variants", () => {
    expect(normalizeRole("owner")).toBe("owner")
    expect(normalizeRole("Owner")).toBe("owner")
    expect(normalizeRole("OWNER")).toBe("owner")
  })

  it("normalizes site_manager variants", () => {
    expect(normalizeRole("site_manager")).toBe("site_manager")
    expect(normalizeRole("Site Manager")).toBe("site_manager")
  })

  it("normalizes accountant", () => {
    expect(normalizeRole("accountant")).toBe("accountant")
  })

  it("normalizes viewer", () => {
    expect(normalizeRole("viewer")).toBe("viewer")
  })
})

describe("canGrantRole", () => {
  it("owner can grant any role", () => {
    const roles: WorkspaceRole[] = ["owner", "site_manager", "accountant", "viewer"]
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
    const roles: WorkspaceRole[] = ["owner", "site_manager", "accountant", "viewer"]
    for (const target of roles) {
      expect(canGrantRole("viewer", target)).toBe(false)
    }
  })
})

describe("requireRole", () => {
  it("does not throw when actor has a sufficient role", () => {
    expect(() => requireRole("owner", ["owner", "site_manager"])).not.toThrow()
    expect(() => requireRole("site_manager", ["owner", "site_manager"])).not.toThrow()
  })

  it("throws forbidden when actor role is not in allowed list", () => {
    expect(() => requireRole("viewer", ["owner", "site_manager"])).toThrow()
    expect(() => requireRole("accountant", ["owner", "site_manager"])).toThrow()
  })
})
