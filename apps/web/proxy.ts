import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

const APP_HOSTNAME = "app.zimba.digital"

export function getRequestHostname(request: NextRequest) {
  const forwardedHost = request.headers
    .get("x-forwarded-host")
    ?.split(",")
    .at(0)
    ?.trim()

  const host =
    forwardedHost ?? request.headers.get("host") ?? request.nextUrl.host

  return host.split(":").at(0)?.toLowerCase() ?? ""
}

export function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers)
  const firstSegment = request.nextUrl.pathname.split("/").filter(Boolean)[0]
  if (
    firstSegment &&
    !["api", "login", "register", "onboarding", "invite", "workspace"].includes(
      firstSegment
    )
  ) {
    requestHeaders.set("x-workspace-slug", firstSegment)
  }

  if (getRequestHostname(request) !== APP_HOSTNAME) {
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  if (request.nextUrl.pathname !== "/") {
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  return NextResponse.rewrite(new URL("/workspace", request.url), {
    request: { headers: requestHeaders },
  })
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
