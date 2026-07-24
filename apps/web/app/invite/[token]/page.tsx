import type { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/core/auth/auth"
import { getInvitationPreview } from "@/core/team/service"
import { acceptInvitationAction } from "./actions"

export const metadata: Metadata = {
  title: "Accept invitation | Zimba",
  description: "Join your team workspace on Zimba.",
}

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session)
    redirect(`/login?callbackUrl=${encodeURIComponent(`/invite/${token}`)}`)
  const invite = await getInvitationPreview(token)

  if (invite.state === "invalid")
    return (
      <main>
        <h1>Invitation not found</h1>
        <p>
          This invitation link is invalid or has expired. Ask your team owner to
          send a new invitation.
        </p>
      </main>
    )

  if (invite.state === "expired")
    return (
      <main>
        <h1>Invitation expired</h1>
        <p>
          This invitation expired on{" "}
          {new Date(invite.expiresAt).toLocaleDateString()}. Ask your team owner
          to send a new invitation.
        </p>
      </main>
    )

  if (invite.state === "used")
    return (
      <main>
        <h1>Invitation already used</h1>
        <p>
          This invitation has already been accepted. If you believe this is an
          error, ask your team owner to send a new invitation.
        </p>
      </main>
    )

  if (session.user.email.toLowerCase() !== invite.email.toLowerCase()) {
    return (
      <main>
        <h1>Wrong account</h1>
        <p>
          This invitation is for <strong>{invite.email}</strong>. Sign out and
          back in with that email address to accept it.
        </p>
      </main>
    )
  }

  return (
    <main>
      <h1>Join {invite.organizationName}</h1>
      <p>This invitation is for {invite.email}.</p>
      <form action={acceptInvitationAction}>
        <input type="hidden" name="token" value={token} />
        <button type="submit">Accept invitation</button>
      </form>
    </main>
  )
}
