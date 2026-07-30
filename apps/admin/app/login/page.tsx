import type { Metadata } from "next"
import { headers } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"
import { acceptSuperAdminInviteUseCase } from "@workspace/api"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
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
  searchParams: Promise<{
    error?: string
    callbackUrl?: string
    token?: string
  }>
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  const { error, callbackUrl, token } = await searchParams
  const inviteToken =
    typeof token === "string" && token.trim().length >= 20
      ? token.trim()
      : null
  const destination = callbackUrl?.startsWith("/")
    ? callbackUrl
    : inviteToken
      ? `/login?token=${encodeURIComponent(inviteToken)}`
      : "/"

  if (token && !inviteToken) {
    return (
      <InviteStatusCard
        title="This invitation link is invalid"
        message="The invitation link is missing a valid token."
      />
    )
  }

  if (session && inviteToken) {
    try {
      await acceptSuperAdminInviteUseCase(
        { userId: session.user.id, email: session.user.email },
        inviteToken
      )
      redirect("/")
    } catch (error_) {
      return (
        <InviteStatusCard
          title="Could not accept this invitation"
          message={error_ instanceof Error ? error_.message : "This invitation could not be completed."}
        />
      )
    }
  }

  if (session) redirect(destination)

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm oauthError={error === "oauth"} callbackUrl={destination} />
      </div>
    </div>
  )
}

function InviteStatusCard({
  title,
  message,
}: {
  title: string
  message: string
}) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background p-6 md:p-10">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/login">Sign in with another account</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
