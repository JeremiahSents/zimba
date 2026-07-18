import { redirect } from "next/navigation"
import { acceptInvitation } from "@/core/team/service"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Accept invitation | Zimba", description: "Join your team workspace on Zimba." }

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  await acceptInvitation(token)
  redirect("/admin/team")
}
