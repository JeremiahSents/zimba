import "server-only"

import type { ResolvedWorkspaceContext } from "@workspace/contracts"
import { SidebarProvider } from "@workspace/ui/components/sidebar"
import { cookies } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { WorkspaceProvider } from "@/components/shared/workspace-provider"
import { getSessionWithOrganization } from "@/core/auth/service"
import { getWorkspaceContext } from "@/core/auth/workspace-context"

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
  if (!session.organization) redirect("/onboarding")

  let workspace: ResolvedWorkspaceContext
  try {
    workspace = await getWorkspaceContext(workspaceSlug)
  } catch {
    notFound()
  }

  const cookieStore = await cookies()
  const sidebarCookie = cookieStore.get(SIDEBAR_COOKIE_NAME)?.value
  const defaultOpen =
    sidebarCookie === undefined ? true : sidebarCookie === "true"

  const user = {
    image: session.user.image ?? null,
    name: session.user.name,
    organizationName: workspace.organizationName,
    role: workspace.role as string,
  }

  return (
    <WorkspaceProvider user={user}>
      <SidebarProvider
        defaultOpen={defaultOpen}
        className="min-h-svh w-full bg-transparent"
      >
        {children}
        {modal}
      </SidebarProvider>
    </WorkspaceProvider>
  )
}
