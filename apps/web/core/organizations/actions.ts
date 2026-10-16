"use server"

import { claimApprovedApplicationUseCase } from "@workspace/api"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/core/auth/auth"
import { getOrganizationMembership } from "./service"

// Applicants do not have a workspace context until this claim succeeds.
export async function claimApprovedWorkspaceAction() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")

  await claimApprovedApplicationUseCase({
    userId: session.user.id,
    email: session.user.email,
  })

  const membership = await getOrganizationMembership(session.user.id)
  if (membership) redirect(`/${membership.slug}/home`)
  redirect("/pending-approval?access=unavailable")
}
