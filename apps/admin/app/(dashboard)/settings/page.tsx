import { AdminDashboardShell } from "@/components/dashboard-shell"
import { SuperAdminInviteForm } from "@/components/super-admin-invite-form"
import { getPlatformSession } from "@/core/auth/service"

export default async function SettingsPage() {
  const session = await getPlatformSession()
  const isSuperAdmin = session?.platformRole === "super_admin"

  return (
    <AdminDashboardShell
      title="Settings"
      description="Manage the internal dashboard's platform-level configuration."
    >
      {isSuperAdmin && <SuperAdminInviteForm />}
    </AdminDashboardShell>
  )
}
