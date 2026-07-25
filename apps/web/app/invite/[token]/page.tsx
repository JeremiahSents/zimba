import type { Metadata } from "next"
import { headers } from "next/headers"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { LoginForm } from "@/components/auth/login-form"
import { auth } from "@/core/auth/auth"
import { getInvitationPreview } from "@/core/team/service"
import { acceptInvitationAction } from "./actions"

export const metadata: Metadata = {
  title: "Accept invitation | Zimba",
  description: "Join your team workspace on Zimba.",
}

function InviteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-6 flex flex-col items-center gap-2 font-medium"
        >
          <div className="flex size-8 items-center justify-center rounded-md">
            <Image
              src="/logo-landing.png"
              alt="Zimba logo"
              width={28}
              height={28}
              style={{ width: "auto", height: "auto" }}
              className="size-7"
            />
          </div>
          <span className="sr-only">Zimba</span>
        </Link>
        {children}
      </div>
    </div>
  )
}

function ErrorCard({
  title,
  message,
}: {
  title: string
  message: React.ReactNode
}) {
  return (
    <InviteLayout>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="secondary" size="lg" className="h-11 w-full" asChild>
            <Link href="/">Back to home</Link>
          </Button>
        </CardContent>
      </Card>
    </InviteLayout>
  )
}

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const callbackUrl = `/invite/${token}`

  let invite
  try {
    invite = await getInvitationPreview(token)
  } catch {
    return (
      <ErrorCard
        title="Invitation not found"
        message="This invitation link is invalid or has expired. Ask your team owner to send a new invitation."
      />
    )
  }

  if (invite.state === "invalid")
    return (
      <ErrorCard
        title="Invitation not found"
        message="This invitation link is invalid or has expired. Ask your team owner to send a new invitation."
      />
    )

  if (invite.state === "expired")
    return (
      <ErrorCard
        title="Invitation expired"
        message={
          <>
            This invitation expired on{" "}
            {new Date(invite.expiresAt).toLocaleDateString()}. Ask your team
            owner to send a new invitation.
          </>
        }
      />
    )

  if (invite.state === "used")
    return (
      <ErrorCard
        title="Invitation already used"
        message="This invitation has already been accepted. If you believe this is an error, ask your team owner to send a new invitation."
      />
    )

  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    return (
      <InviteLayout>
        <LoginForm
          callbackUrl={callbackUrl}
          invitation={{
            organizationName: invite.organizationName,
            email: invite.email,
          }}
        />
      </InviteLayout>
    )
  }

  if (session.user.email.toLowerCase() !== invite.email.toLowerCase()) {
    return (
      <ErrorCard
        title="Wrong account"
        message={
          <>
            This invitation is for <strong>{invite.email}</strong>. Sign out and
            back in with that email address to accept it.
          </>
        }
      />
    )
  }

  return (
    <InviteLayout>
      <Card>
        <CardHeader>
          <CardTitle>Join {invite.organizationName}</CardTitle>
          <CardDescription>
            You&apos;re signed in as {invite.email}. Accept your invitation to
            join the team.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={acceptInvitationAction}>
            <input type="hidden" name="token" value={token} />
            <Button type="submit" size="lg" className="h-11 w-full">
              Accept invitation
            </Button>
          </form>
        </CardContent>
      </Card>
    </InviteLayout>
  )
}
