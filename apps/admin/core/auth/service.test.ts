import { describe, expect, it } from "vitest"
import { platformRoles } from "./roles"

describe("platform roles", () => {
  it("only exposes assignable platform roles", () => {
    expect(platformRoles).toEqual(["super_admin", "support"])
    expect(platformRoles).not.toContain("none")
  })
})
