import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

const APP_HOSTNAME = "app.zimba.digital"
const ROOT_DOMAIN = "zimba.digital"
const APP_ORIGIN = `https://${APP_HOSTNAME}`

/**
 * Better Auth trusts the app subdomain and nothing else, so a sign-up posted
 * from www.zimba.digital is rejected with "Invalid origin". Anyone who reaches
 * an auth page on a marketing host — an old link, a search result — is sent to
 * the app host before they can fill in a form.
 */
const AUTH_SEGMENTS = [
  "login",
  "register",
  "onboarding",
  "invite",
  "forgot-password",
  "reset-password",
  "verify-email",
  "pending-approval",
]

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

/** Mirrors LAST_WORKSPACE_COOKIE in app/[workspaceSlug]/layout.tsx. */
const LAST_WORKSPACE_COOKIE = "zimba_last_workspace"
const LAST_WORKSPACE_MAX_AGE = 60 * 60 * 24 * 365

const NON_WORKSPACE_SEGMENTS = [
  "api",
  "login",
  "register",
  "onboarding",
  "invite",
  "workspace",
  "forgot-password",
  "reset-password",
  "verify-email",
]

export function proxy(request: NextRequest) {
  const authRedirect = buildAuthRedirect(request)
  if (authRedirect) return authRedirect

  const requestHeaders = new Headers(request.headers)
  const firstSegment = request.nextUrl.pathname.split("/").filter(Boolean)[0]
  const workspaceSlug =
    firstSegment && !NON_WORKSPACE_SEGMENTS.includes(firstSegment)
      ? firstSegment
      : null

  if (workspaceSlug) {
    requestHeaders.set("x-workspace-slug", workspaceSlug)
  }

  const response = buildResponse(request, requestHeaders)

  // Remembered here rather than in the layout because a Server Component
  // cannot set cookies. With several workspaces the entry redirect would
  // otherwise land on an arbitrary one.
  if (workspaceSlug) {
    response.cookies.set(LAST_WORKSPACE_COOKIE, workspaceSlug, {
      path: "/",
      maxAge: LAST_WORKSPACE_MAX_AGE,
      sameSite: "lax",
      httpOnly: false,
    })
  }

  return response
}

/**
 * Only production zimba.digital hosts are moved. Localhost and preview
 * deployments serve auth on whatever host they run on, and that host is the one
 * their own BETTER_AUTH_URL names.
 */
function buildAuthRedirect(request: NextRequest) {
  const hostname = getRequestHostname(request)
  const isZimbaHost =
    hostname === ROOT_DOMAIN || hostname.endsWith(`.${ROOT_DOMAIN}`)

  if (!isZimbaHost || hostname === APP_HOSTNAME) return null

  const firstSegment = request.nextUrl.pathname.split("/").filter(Boolean)[0]
  if (!firstSegment || !AUTH_SEGMENTS.includes(firstSegment)) return null

  return NextResponse.redirect(
    new URL(`${request.nextUrl.pathname}${request.nextUrl.search}`, APP_ORIGIN)
  )
}

function buildResponse(request: NextRequest, requestHeaders: Headers) {
  const isEntryRewrite =
    getRequestHostname(request) === APP_HOSTNAME &&
    request.nextUrl.pathname === "/"

  if (!isEntryRewrite) {
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  return NextResponse.rewrite(new URL("/workspace", request.url), {
    request: { headers: requestHeaders },
  })
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
