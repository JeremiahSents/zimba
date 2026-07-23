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
  if (getRequestHostname(request) !== APP_HOSTNAME) {
    return NextResponse.next()
  }

  if (request.nextUrl.pathname !== "/") {
    return NextResponse.next()
  }

  return NextResponse.rewrite(new URL("/admin", request.url))
}

export const config = {
  matcher: "/",
}
