"use server"

import { redirect } from "next/navigation"
import { acceptInvitation } from "@/core/team/service"

export async function acceptInvitationAction(formData: FormData) {
  const token = formData.get("token")
  if (typeof token !== "string") redirect("/login")
  const workspaceSlug = await acceptInvitation(token)
  redirect(`/${workspaceSlug}/team`)
}
