import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { ActivityRow } from "@/components/shared/activity-row"
import { DashboardShell } from "@/components/shared/dashboard-shell"
import { SettingField } from "@/components/shared/setting-field"

export function SettingsPage({
  company,
  role,
}: {
  company: string
  role: string
}) {
  return (
    <DashboardShell
      title="Settings"
      subtitle="Configure company profile, notifications, and permissions."
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <section className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company profile</CardTitle>
              <CardDescription>
                Details shown across project reports and approvals.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <SettingField label="Company" value={company} />
              <SettingField label="Currency" value="UGX" />
              <SettingField label="Default region" value="Uganda" />
              <SettingField label="Fiscal period" value="Monthly" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Notification preferences</CardTitle>
              <CardDescription>
                Alerts that should appear in the dashboard header.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ActivityRow
                title="Budget risk"
                detail="Notify when a project crosses 80% spend."
                value="On"
              />
              <ActivityRow
                title="Pending approvals"
                detail="Notify admins when payments wait longer than 24h."
                value="On"
              />
              <ActivityRow
                title="Weekly report"
                detail="Send Monday project spend summaries."
                value="Draft"
              />
            </CardContent>
          </Card>
        </section>
        <aside>
          <Card>
            <CardHeader>
              <CardTitle>Role access</CardTitle>
              <CardDescription>
                Current dashboard permission groups.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="py-2">
                <p className="font-medium">{role}</p>
                <p className="text-muted-foreground text-sm">
                  Your current workspace role.
                </p>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </DashboardShell>
  )
}
