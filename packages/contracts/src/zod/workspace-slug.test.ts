import { describe, expect, it } from "vitest"
import {
  generateUniqueSlug,
  isReservedSlug,
  normalizeSlug,
  workspaceSlugSchema,
} from "./workspace-slug"

describe("slug normalization", () => {
  it("lowercases and hyphenates", () => {
    expect(normalizeSlug("Zimba Consultants")).toBe("zimba-consultants")
  })

  it("removes accents", () => {
    expect(normalizeSlug("Café Résumé")).toBe("cafe-resume")
  })

  it("collapses repeated hyphens", () => {
    expect(normalizeSlug("a---b")).toBe("a-b")
  })

  it("removes leading and trailing hyphens", () => {
    expect(normalizeSlug("---hello---")).toBe("hello")
  })

  it("allows only letters, numbers and hyphens", () => {
    expect(normalizeSlug("hello@world!")).toBe("hello-world")
  })

  it("falls back to workspace for empty input", () => {
    expect(normalizeSlug("")).toBe("workspace")
    expect(normalizeSlug("---")).toBe("workspace")
  })

  it("truncates to 54 characters", () => {
    const long = "a".repeat(100)
    expect(normalizeSlug(long).length).toBe(54)
  })
})

describe("reserved slug names", () => {
  it("blocks reserved route names", () => {
    expect(isReservedSlug("admin")).toBe(true)
    expect(isReservedSlug("api")).toBe(true)
    expect(isReservedSlug("login")).toBe(true)
    expect(isReservedSlug("onboarding")).toBe(true)
    expect(isReservedSlug("settings")).toBe(true)
  })

  it("allows non-reserved names", () => {
    expect(isReservedSlug("zimba-consultants")).toBe(false)
    expect(isReservedSlug("acme-ltd")).toBe(false)
  })
})

describe("generateUniqueSlug", () => {
  it("returns normalized slug when available", () => {
    expect(generateUniqueSlug("Acme Ltd", [])).toBe("acme-ltd")
  })

  it("appends suffix on collision", () => {
    expect(generateUniqueSlug("Acme Ltd", ["acme-ltd"])).toBe("acme-ltd-1")
  })

  it("appends suffix for reserved names", () => {
    expect(generateUniqueSlug("Admin", [])).toBe("admin-1")
  })

  it("increments suffix until available", () => {
    expect(generateUniqueSlug("Acme Ltd", ["acme-ltd", "acme-ltd-1"])).toBe(
      "acme-ltd-2"
    )
  })
})

describe("workspaceSlugSchema", () => {
  it("accepts valid slugs", () => {
    expect(workspaceSlugSchema.safeParse("zimba-consultants").success).toBe(
      true
    )
  })

  it("rejects reserved slugs", () => {
    expect(workspaceSlugSchema.safeParse("admin").success).toBe(false)
  })

  it("rejects uppercase", () => {
    expect(workspaceSlugSchema.safeParse("Acme").success).toBe(false)
  })

  it("rejects leading hyphens", () => {
    expect(workspaceSlugSchema.safeParse("-acme").success).toBe(false)
  })

  it("rejects too-short slugs", () => {
    expect(workspaceSlugSchema.safeParse("a").success).toBe(false)
  })
})
