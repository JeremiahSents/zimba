"use server"

import { revokeWorkspaceAccessUseCase } from "@workspace/api"
import { redirect } from "next/navigation"
import { requireSession } from "./service"

export async function exitWorkspaceGrantAction() {
  const session = await requireSession()
  if (session.organization.viaGrantId) {
    await revokeWorkspaceAccessUseCase({ actorId: session.user.id })
  }
  redirect("/")
}
