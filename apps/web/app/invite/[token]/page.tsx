import { redirect } from "next/navigation"
import { acceptInvitation } from "@/core/team/service"
import type { Metadata } from "next"
import { headers } from "next/headers"
import { auth } from "@/core/auth/auth"

export const metadata: Metadata = { title: "Accept invitation | Zimba", description: "Join your team workspace on Zimba." }

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect(`/login?callbackUrl=${encodeURIComponent(`/invite/${token}`)}`)
  await acceptInvitation(token)
  redirect("/admin/team")
}
