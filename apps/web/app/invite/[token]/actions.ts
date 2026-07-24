"use server"

import { redirect } from "next/navigation"
import { acceptInvitation } from "@/core/team/service"
import { validationError } from "../../../core/shared/errors"

export async function acceptInvitationAction(formData: FormData) {
  const token = formData.get("token")
  if (typeof token !== "string" || token.length < 20)
    validationError("This invitation link is invalid.")
  const workspaceSlug = await acceptInvitation(token)
  redirect(`/${workspaceSlug}/team`)
}
