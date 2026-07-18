import { SidebarProvider } from "@workspace/ui/components/sidebar"
import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"
import { WorkspaceProvider } from "@/components/shared/workspace-provider"
import { auth } from "@/core/auth/auth"
import { getOrganizationMembership } from "@/core/organizations/service"

const SIDEBAR_COOKIE_NAME = "sidebar_state"

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const user = await getAuthenticatedWorkspaceUser()

  const cookieStore = await cookies()
  const sidebarCookie = cookieStore.get(SIDEBAR_COOKIE_NAME)?.value
  const defaultOpen =
    sidebarCookie === undefined ? true : sidebarCookie === "true"

  return (
    <WorkspaceProvider user={user}>
      <SidebarProvider
        defaultOpen={defaultOpen}
        className="min-h-svh w-full bg-transparent"
      >
        {children}
      </SidebarProvider>
    </WorkspaceProvider>
  )
}

async function getAuthenticatedWorkspaceUser() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")
  const membership = await getOrganizationMembership(session.user.id)
  if (!membership) redirect("/onboarding")

  return {
    image: session.user.image ?? null,
    name: session.user.name,
    organizationName: membership.organizationName,
    role: membership.role,
  }
}
