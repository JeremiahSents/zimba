import type { Metadata } from "next"
import { headers } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"
import { LoginForm } from "@/components/auth/login-form"
import { auth } from "@/core/auth/auth"
import { ACCESS_EXPIRED } from "@/core/auth/login-errors"
import { isDemoMode } from "@/core/demo/demo-data"
import { getOrganizationMembership } from "@/core/organizations/service"
import { getInvitationPreview } from "@/core/team/service"

export const metadata: Metadata = {
  title: "Sign in | Zimba",
  description: "Sign in to your Zimba construction expense dashboard.",
}

export const dynamic = "force-dynamic"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string
    callbackUrl?: string
    reset?: string
  }>
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  const { error, callbackUrl, reset } = await searchParams
  const destination = callbackUrl?.startsWith("/") ? callbackUrl : "/workspace"
  const demoEnabled = isDemoMode()
  const accessExpired = error === ACCESS_EXPIRED
  // A lapsed workspace grant leaves staff signed in but with nothing to open,
  // so skip the usual redirect and let the notice explain what happened.
  if (session && !accessExpired) {
    if (destination.startsWith("/invite/")) redirect(destination)
    const membership = await getOrganizationMembership(session.user.id)
    redirect(
      membership && destination === "/workspace"
        ? `/${membership.slug}/home`
        : membership
          ? destination
          : "/pending-approval"
    )
  }

  let invitation: { organizationName: string; email: string } | undefined
  if (destination.startsWith("/invite/")) {
    const token = destination.slice("/invite/".length)
    try {
      const preview = await getInvitationPreview(token)
      if (preview.state === "pending")
        invitation = {
          organizationName: preview.organizationName,
          email: preview.email,
        }
    } catch {}
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm
          oauthError={error === "oauth"}
          accessExpired={accessExpired}
          passwordReset={reset === "1"}
          callbackUrl={destination}
          invitation={invitation}
        />
        {demoEnabled && (
          <p className="mt-4 text-center text-muted-foreground text-sm">
            Want to look around first?{" "}
            <Link
              href="/demo"
              className="font-medium text-primary hover:underline"
            >
              Try the demo
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
