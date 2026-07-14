import { SidebarProvider } from "@workspace/ui/components/sidebar"
import { cookies } from "next/headers"

const SIDEBAR_COOKIE_NAME = "sidebar_state"

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
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
