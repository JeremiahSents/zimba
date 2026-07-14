import { SidebarProvider } from "@workspace/ui/components/sidebar"
import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getOrganizationMembership } from "@/lib/organization"

const SIDEBAR_COOKIE_NAME = "sidebar_state"

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")
  const membership = await getOrganizationMembership(session.user.id)
  if (!membership) redirect("/onboarding")

  const cookieStore = await cookies()
  const sidebarCookie = cookieStore.get(SIDEBAR_COOKIE_NAME)?.value
  const defaultOpen =
    sidebarCookie === undefined ? true : sidebarCookie === "true"

  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      className="min-h-svh w-full bg-transparent"
    >
      {children}
    </SidebarProvider>
  )
}
