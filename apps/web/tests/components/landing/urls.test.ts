import { describe, expect, it } from "vitest"
import {
  APP_ORIGIN,
  MARKETING_ORIGIN,
  getLoginHref,
  getBookDemoHref,
  getRegisterHref,
} from "@/components/landing/urls"

describe("getLoginHref", () => {
  it("points production sign-in to the app subdomain", () => {
    expect(getLoginHref("production")).toBe(`${APP_ORIGIN}/login`)
  })

  it("keeps local development sign-in relative", () => {
    expect(getLoginHref("development")).toBe("/login")
  })
})

describe("getRegisterHref", () => {
  it("points production sign-up to the app subdomain", () => {
    expect(getRegisterHref("production")).toBe(`${APP_ORIGIN}/register`)
  })

  it("keeps local development sign-up relative", () => {
    expect(getRegisterHref("development")).toBe("/register")
  })
})

describe("getBookDemoHref", () => {
  it("points production back at the marketing landing page", () => {
    expect(getBookDemoHref("production")).toBe(`${MARKETING_ORIGIN}/#book-demo`)
  })

  it("keeps local development relative", () => {
    expect(getBookDemoHref("development")).toBe("/#book-demo")
  })
})
