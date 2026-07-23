import { describe, expect, it } from "vitest"
import {
  canManageWorkspace,
  isOwner,
  requireMinimumRole,
  requireRole,
} from "./authorization"

describe("workspace authorization", () => {
  it("allows exact role match", () => {
    expect(requireRole("accountant", ["accountant"])).toBe("accountant")
  })

  it("throws forbidden for non-allowed role", () => {
    expect(() => requireRole("viewer", ["owner"])).toThrow()
  })

  it("requireMinimumRole respects hierarchy", () => {
    expect(requireMinimumRole("owner", "site_manager")).toBe("owner")
    expect(requireMinimumRole("site_manager", "site_manager")).toBe(
      "site_manager"
    )
    expect(() => requireMinimumRole("viewer", "site_manager")).toThrow()
  })

  it("canManageWorkspace returns true for site_manager and above", () => {
    expect(canManageWorkspace("owner")).toBe(true)
    expect(canManageWorkspace("site_manager")).toBe(true)
    expect(canManageWorkspace("accountant")).toBe(false)
    expect(canManageWorkspace("viewer")).toBe(false)
  })

  it("isOwner returns true only for owner", () => {
    expect(isOwner("owner")).toBe(true)
    expect(isOwner("site_manager")).toBe(false)
  })
})
