import type { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { LoginForm } from "@/components/login-form"
import { auth } from "@/core/auth/auth"

export const metadata: Metadata = {
  title: "Sign in | Zimba Admin",
  description: "Sign in to the Zimba admin dashboard.",
}

export const dynamic = "force-dynamic"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  const { error, callbackUrl } = await searchParams
  const destination = callbackUrl?.startsWith("/") ? callbackUrl : "/"
  if (session) redirect(destination)

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm oauthError={error === "oauth"} callbackUrl={destination} />
      </div>
    </div>
  )
}
