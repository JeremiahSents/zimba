import { describe, expect, it } from "vitest"
import { APP_ORIGIN, getLoginHref } from "./urls"

describe("getLoginHref", () => {
  it("points production sign-in to the app subdomain", () => {
    expect(getLoginHref("production")).toBe(`${APP_ORIGIN}/login`)
  })

  it("keeps local development sign-in relative", () => {
    expect(getLoginHref("development")).toBe("/login")
  })
})
