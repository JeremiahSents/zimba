import { SidebarInset, SidebarProvider } from "@workspace/ui/components/sidebar"
import { redirect } from "next/navigation"
import { SuperAdminSidebar } from "@/components/sidebar"
import { getPlatformSession } from "@/core/auth/service"

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getPlatformSession()

  if (!session) redirect("/login")
  if (
    session.platformRole !== "super_admin" &&
    session.platformRole !== "support"
  ) {
    redirect("https://zimba.digital")
  }

  return (
    <div className="flex min-h-dvh bg-sidebar">
      <SidebarProvider>
        <SuperAdminSidebar />
        <SidebarInset className="flex w-full min-w-0 flex-col bg-background">
          {children}
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
