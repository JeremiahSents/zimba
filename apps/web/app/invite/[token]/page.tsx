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
  if (invite.state !== "pending")
    return (
      <main>
        <h1>Invitation unavailable</h1>
        <p>This invitation is {invite.state}.</p>
      </main>
    )
  if (session.user.email.toLowerCase() !== invite.email.toLowerCase()) {
    return (
      <main>
        <h1>Wrong account</h1>
        <p>Sign in with {invite.email} to accept this invitation.</p>
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
