"use server"

import { revokeWorkspaceAccessUseCase } from "@workspace/api"
import { redirect } from "next/navigation"
import { requireSession } from "./service"

export async function exitWorkspaceGrantAction() {
  const session = await requireSession()
  if (session.viaGrant) {
    await revokeWorkspaceAccessUseCase({ actorId: session.user.id })
  }
  redirect("/")
}
