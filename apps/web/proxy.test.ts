import { NextRequest } from "next/server"
import { describe, expect, it } from "vitest"
import { getRequestHostname, proxy } from "./proxy"

function request(url: string, headers?: HeadersInit) {
  return new NextRequest(url, { headers })
}

describe("proxy", () => {
  it("rewrites app subdomain root to the dashboard", () => {
    const response = proxy(request("https://app.zimba.digital/"))

    expect(response.headers.get("x-middleware-rewrite")).toBe(
      "https://app.zimba.digital/admin"
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
      "https://zimba.digital/admin"
    )
  })

  it("uses forwarded host before the request URL host", () => {
    const proxiedHostRequest = request("https://zimba.digital/", {
      "x-forwarded-host": "app.zimba.digital",
    })

    expect(getRequestHostname(proxiedHostRequest)).toBe("app.zimba.digital")
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
