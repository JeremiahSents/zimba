import { redirect } from "next/navigation"
import { acceptInvitation } from "@/core/team/service"

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  await acceptInvitation(token)
  redirect("/admin/team")
}
