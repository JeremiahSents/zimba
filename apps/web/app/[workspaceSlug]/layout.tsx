import "server-only"

import type { ResolvedWorkspaceContext } from "@workspace/api"
import { SidebarProvider } from "@workspace/ui/components/sidebar"
import { cookies } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { GrantBanner } from "@/components/shared/grant-banner"
import { WorkspaceProvider } from "@/components/shared/workspace-provider"
import { ACCESS_EXPIRED } from "@/core/auth/login-errors"
import { isPlatformStaff, getSessionWithOrganization } from "@/core/auth/service"
import { getWorkspaceContext } from "@/core/auth/workspace-context"
import { getOnboardingApplicationForUser } from "@/core/organizations/onboarding-application"

const SIDEBAR_COOKIE_NAME = "sidebar_state"

export default async function WorkspaceLayout({
  children,
  modal,
  params,
}: Readonly<{
  children: React.ReactNode
  modal?: React.ReactNode
  params: Promise<{ workspaceSlug: string }>
}>) {
  const { workspaceSlug } = await params

  const session = await getSessionWithOrganization()
  if (!session) redirect("/login")

  if (!session.organization) {
    // Platform staff have no membership to fall back on, so a lapsed grant
    // lands here. Send them to sign in again rather than into onboarding.
    if (await isPlatformStaff(session.user.id)) {
      redirect(`/login?error=${ACCESS_EXPIRED}`)
    }
    const application = await getOnboardingApplicationForUser(session.user.id)
    if (
      application &&
      (application.status === "pending" || application.status === "rejected")
    )
      redirect("/pending-approval")
    redirect("/onboarding")
  }

  let workspace: ResolvedWorkspaceContext | null = null
  try {
    workspace = await getWorkspaceContext(workspaceSlug)
  } catch {
    // redirect() throws, so the decision has to happen outside the catch.
    workspace = null
  }

  if (!workspace) {
    if (await isPlatformStaff(session.user.id)) {
      redirect(`/login?error=${ACCESS_EXPIRED}`)
    }
    notFound()
  }

  const cookieStore = await cookies()
  const sidebarCookie = cookieStore.get(SIDEBAR_COOKIE_NAME)?.value
  const defaultOpen =
    sidebarCookie === undefined ? true : sidebarCookie === "true"

  // Scoped to the workspace actually being viewed, not the session-wide
  // lookup: staff can hold a grant on one tenant while being a real member
  // of another, and the banner belongs only on the granted one.
  const viaGrant = Boolean(workspace.viaGrantId)

  const user = {
    image: session.user.image ?? null,
    name: session.user.name,
    organizationName: workspace.organizationName,
    role: workspace.role as string,
    viaGrant,
  }

  return (
    <WorkspaceProvider user={user}>
      <SidebarProvider
        defaultOpen={defaultOpen}
        className="min-h-svh w-full bg-transparent"
      >
        {viaGrant && (
          <GrantBanner organizationName={workspace.organizationName} />
        )}
        {children}
        {modal}
      </SidebarProvider>
    </WorkspaceProvider>
  )
}
