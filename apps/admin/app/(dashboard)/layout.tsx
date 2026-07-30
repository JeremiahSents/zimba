import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { AdminChrome } from "@/components/admin-chrome"
import { getPlatformSession } from "@/core/auth/service"

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getPlatformSession()
  const sidebarState = (await cookies()).get("sidebar_state")?.value !== "false"

  if (!session) redirect("/login")
  if (
    session.platformRole !== "super_admin" &&
    session.platformRole !== "support"
  ) {
    redirect("https://zimba.digital")
  }

  return (
    <AdminChrome
      defaultOpen={sidebarState}
      user={{
        name: session.user.name ?? "Admin",
        image: session.user.image ?? null,
        platformRole: session.platformRole ?? null,
      }}
    >
      {children}
    </AdminChrome>
  )
}
