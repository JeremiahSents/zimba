import { NextRequest } from "next/server"
import { describe, expect, it } from "vitest"
import { getRequestHostname, proxy } from "@/proxy"

function request(url: string, headers?: HeadersInit) {
  return new NextRequest(url, { headers })
}

describe("proxy", () => {
  it("rewrites app subdomain root to the dashboard", () => {
    const response = proxy(request("https://app.zimba.digital/"))

    expect(response.headers.get("x-middleware-rewrite")).toBe(
      "https://app.zimba.digital/workspace"
    )
  })

  it("keeps the marketing domain root on the marketing page", () => {
    const response = proxy(request("https://zimba.digital/"))

    expect(response.headers.get("x-middleware-next")).toBe("1")
    expect(response.headers.get("x-middleware-rewrite")).toBeNull()
  })

  it("normalizes host ports", () => {
    const response = proxy(
      request("https://zimba.digital/", { host: "app.zimba.digital:443" })
    )

    expect(response.headers.get("x-middleware-rewrite")).toBe(
      "https://zimba.digital/workspace"
    )
  })

  it("uses forwarded host before the request URL host", () => {
    const proxiedHostRequest = request("https://zimba.digital/", {
      "x-forwarded-host": "app.zimba.digital",
    })

    expect(getRequestHostname(proxiedHostRequest)).toBe("app.zimba.digital")
  })

  it("moves auth pages off the marketing host onto the app subdomain", () => {
    const response = proxy(request("https://www.zimba.digital/register?next=/"))

    expect(response.status).toBe(307)
    expect(response.headers.get("location")).toBe(
      "https://app.zimba.digital/register?next=/"
    )
  })

  it("leaves auth pages alone once they are on the app subdomain", () => {
    const response = proxy(request("https://app.zimba.digital/login"))

    expect(response.headers.get("location")).toBeNull()
    expect(response.headers.get("x-middleware-next")).toBe("1")
  })

  it("leaves local development auth pages on localhost", () => {
    const response = proxy(request("http://localhost:3000/register"))

    expect(response.headers.get("location")).toBeNull()
    expect(response.headers.get("x-middleware-next")).toBe("1")
  })

  it("keeps marketing pages on the marketing host", () => {
    const response = proxy(request("https://www.zimba.digital/privacy"))

    expect(response.headers.get("location")).toBeNull()
    expect(response.headers.get("x-middleware-next")).toBe("1")
  })

  it("forwards the workspace slug as trusted request context", () => {
    const response = proxy(
      request("https://app.zimba.digital/zimba-consultants/projects")
    )

    expect(response.headers.get("x-middleware-request-x-workspace-slug")).toBe(
      "zimba-consultants"
    )
  })
})
