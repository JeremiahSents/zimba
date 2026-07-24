import type { Metadata } from "next"
import { headers } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"
import { LoginForm } from "@/components/auth/login-form"
import { auth } from "@/core/auth/auth"
import { isDemoMode } from "@/core/demo/demo-data"
import { getOrganizationMembership } from "@/core/organizations/service"

export const metadata: Metadata = {
  title: "Sign in | Zimba",
  description: "Sign in to your Zimba construction expense dashboard.",
}

export const dynamic = "force-dynamic"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  const { error, callbackUrl } = await searchParams
  const destination = callbackUrl?.startsWith("/") ? callbackUrl : "/workspace"
  const demoEnabled = isDemoMode()
  if (session) {
    if (destination.startsWith("/invite/")) redirect(destination)
    const membership = await getOrganizationMembership(session.user.id)
    redirect(
      membership && destination === "/workspace"
        ? `/${membership.slug}/home`
        : membership
          ? destination
          : "/onboarding"
    )
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm oauthError={error === "oauth"} callbackUrl={destination} />
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
