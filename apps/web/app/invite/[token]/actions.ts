"use server"

import { redirect } from "next/navigation"
import { acceptInvitation } from "@/core/team/service"

export async function acceptInvitationAction(formData: FormData) {
  const token = formData.get("token")
  if (typeof token !== "string" || token.length < 20) return
  const workspaceSlug = await acceptInvitation(token)
  redirect(`/${workspaceSlug}/team`)
}
