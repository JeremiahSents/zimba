import type { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { LoginForm } from "@/components/auth/login-form"
import { isAuthBypassEnabled } from "@/lib/api/auth-mode"
import { auth } from "@/lib/auth"
import { getOrganizationMembership } from "@/lib/organization"

export const metadata: Metadata = {
  title: "Sign in | Zimba",
  description: "Sign in to your Zimba construction expense dashboard.",
}

export const dynamic = "force-dynamic"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  if (isAuthBypassEnabled()) redirect("/admin/home")

  const session = await auth.api.getSession({ headers: await headers() })
  if (session) {
    const membership = await getOrganizationMembership(session.user.id)
    redirect(membership ? "/admin/home" : "/onboarding")
  }

  const { error } = await searchParams

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm oauthError={error === "oauth"} />
      </div>
    </div>
  )
}
