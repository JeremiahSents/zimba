import { describe, expect, it } from "vitest"
import { formatShortDate } from "./format"

describe("formatShortDate", () => {
  it("formats a date-only value", () => {
    expect(formatShortDate("2026-07-15")).toBe("15 Jul 2026")
  })

  it("formats a full ISO timestamp", () => {
    expect(formatShortDate("2026-07-15T00:00:00.000Z")).toBe("15 Jul 2026")
  })

  it("does not throw for an invalid value", () => {
    expect(formatShortDate("")).toBe("Unknown date")
  })
})
