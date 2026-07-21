import { describe, expect, it } from "vitest"
import { buildInviteUrl } from "./invite-url"

describe("buildInviteUrl", () => {
  it("builds a URL from an explicit app URL", () => {
    expect(buildInviteUrl("abc123", "https://app.zimba.digital")).toBe(
      "https://app.zimba.digital/invite/abc123",
    )
  })

  it("strips trailing slashes from the base URL", () => {
    expect(buildInviteUrl("abc123", "https://app.zimba.digital/")).toBe(
      "https://app.zimba.digital/invite/abc123",
    )
  })

  it("strips multiple trailing slashes", () => {
    expect(buildInviteUrl("tok", "http://localhost:3000//")).toBe(
      "http://localhost:3000/invite/tok",
    )
  })

  it("falls back to APP_URL env var when no explicit URL provided", () => {
    const original = process.env.APP_URL
    process.env.APP_URL = "https://staging.zimba.digital"
    expect(buildInviteUrl("xyz")).toBe(
      "https://staging.zimba.digital/invite/xyz",
    )
    process.env.APP_URL = original
  })

  it("falls back to BETTER_AUTH_URL when APP_URL is not set", () => {
    const originalApp = process.env.APP_URL
    const originalAuth = process.env.BETTER_AUTH_URL
    delete process.env.APP_URL
    process.env.BETTER_AUTH_URL = "http://localhost:3000"
    expect(buildInviteUrl("token456")).toBe(
      "http://localhost:3000/invite/token456",
    )
    process.env.APP_URL = originalApp
    process.env.BETTER_AUTH_URL = originalAuth
  })

  it("falls back to localhost default", () => {
    const originalApp = process.env.APP_URL
    const originalAuth = process.env.BETTER_AUTH_URL
    delete process.env.APP_URL
    delete process.env.BETTER_AUTH_URL
    expect(buildInviteUrl("t")).toBe("http://localhost:3000/invite/t")
    process.env.APP_URL = originalApp
    process.env.BETTER_AUTH_URL = originalAuth
  })
})
