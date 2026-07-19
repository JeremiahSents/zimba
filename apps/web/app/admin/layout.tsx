import { SidebarProvider } from "@workspace/ui/components/sidebar"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { WorkspaceProvider } from "@/components/shared/workspace-provider"
import { getSessionWithOrganization } from "@/core/auth/service"

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
  const session = await getSessionWithOrganization()
  if (!session) redirect("/login")
  if (!session.organization) redirect("/onboarding")
  const { user, organization } = session

  return {
    image: user.image ?? null,
    name: user.name,
    organizationName: organization.organizationName,
    role: organization.role,
  }
}
