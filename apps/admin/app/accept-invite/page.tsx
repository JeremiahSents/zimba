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
import { auth } from "@/core/auth/auth"

export const metadata: Metadata = {
  title: "Accept invitation | Zimba Admin",
  description: "Accept your super-admin invitation to the Zimba admin dashboard.",
}

export const dynamic = "force-dynamic"

export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams
  const inviteToken =
    typeof token === "string" && token.trim().length >= 20
      ? token.trim()
      : null

  // 1. Missing/malformed token → error card.
  if (!inviteToken) {
    return (
      <InviteStatusCard
        title="This invitation link is invalid"
        message="The invitation link is missing a valid token. Check that you copied the full link from your email."
      />
    )
  }

  const session = await auth.api.getSession({ headers: await headers() })

  // 2. No session → send to login, then back here once signed in. The
  // callbackUrl starts with "/" so it satisfies the login page's guard.
  if (!session?.session) {
    redirect(
      `/login?callbackUrl=${encodeURIComponent(`/accept-invite?token=${inviteToken}`)}`
    )
  }

  // 3. Session exists → claim the invitation. Success lands on the dashboard
  // (the platform-role guard now passes because a platform_user row exists).
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
        message={
          error_ instanceof Error
            ? error_.message
            : "This invitation could not be completed."
        }
      />
    )
  }
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
            <Link href="/login">Sign in with a different account</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
