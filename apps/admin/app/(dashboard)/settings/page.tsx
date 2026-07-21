import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import Link from "next/link"
import { AdminDashboardShell } from "@/components/dashboard-shell"
import { SuperAdminInviteForm } from "@/components/super-admin-invite-form"
import { getPlatformSession } from "@/core/auth/service"

export default async function SettingsPage() {
  const session = await getPlatformSession()
  const isSuperAdmin = session?.platformRole === "super_admin"

  return (
    <AdminDashboardShell
      title="Settings"
      headerGreeting="Settings"
      userName={session?.user.name ?? "Admin"}
      userImage={session?.user.image ?? null}
    >
      <section className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <h2 className="font-heading font-semibold text-base text-foreground tracking-tight">
          Admin Settings
        </h2>
      </section>

      <div className="space-y-6">
        {isSuperAdmin && <SuperAdminInviteForm />}

        <Card>
          <CardHeader>
            <CardTitle>Super Admin Access</CardTitle>
            <CardDescription>
              Manage users who have access to this internal dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground text-sm">
              Access is controlled via the <code>platform_user</code> table in
              the database. Ensure users are assigned the{" "}
              <code>super_admin</code> or <code>support</code> role.
            </p>
            <Button variant="outline" asChild>
              <Link href="/users">View Platform Users</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feature Flags</CardTitle>
            <CardDescription>
              Enable or disable experimental features across the platform.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <div className="font-medium">AI Receipt Parsing</div>
                <div className="text-muted-foreground text-sm">
                  Automatically extract data from uploaded receipts.
                </div>
              </div>
              <Button variant="secondary" size="sm">
                Enabled
              </Button>
            </div>
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <div className="font-medium">Stripe Integration (Beta)</div>
                <div className="text-muted-foreground text-sm">
                  Process live payments instead of manual records.
                </div>
              </div>
              <Button variant="outline" size="sm">
                Disabled
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 dark:border-red-900/50">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400">
              Danger Zone
            </CardTitle>
            <CardDescription>
              Destructive actions that affect the entire platform.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between border-red-100 border-b pb-4 dark:border-red-900/30">
              <div>
                <div className="font-medium">Maintenance Mode</div>
                <div className="text-muted-foreground text-sm">
                  Lock out all users except Super Admins.
                </div>
              </div>
              <Button variant="destructive" size="sm" disabled>
                Enable
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminDashboardShell>
  )
}
