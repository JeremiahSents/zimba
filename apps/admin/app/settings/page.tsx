import { PageHeader } from "../../components/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"

export default function SettingsPage() {
  return (
    <div className="flex-1 p-6 lg:p-8 max-w-4xl">
      <PageHeader 
        title="Admin Settings" 
        description="Configure Super Admin preferences and internal feature flags."
      />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Super Admin Access</CardTitle>
            <CardDescription>Manage users who have access to this internal dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Access is controlled via the <code>platform_user</code> table in the database. Ensure users are assigned the <code>super_admin</code> or <code>support</code> role.
            </p>
            <Button variant="outline">View Platform Users</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feature Flags</CardTitle>
            <CardDescription>Enable or disable experimental features across the platform.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <div className="font-medium">AI Receipt Parsing</div>
                <div className="text-sm text-muted-foreground">Automatically extract data from uploaded receipts.</div>
              </div>
              <Button variant="secondary" size="sm">Enabled</Button>
            </div>
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <div className="font-medium">Stripe Integration (Beta)</div>
                <div className="text-sm text-muted-foreground">Process live payments instead of manual records.</div>
              </div>
              <Button variant="outline" size="sm">Disabled</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 dark:border-red-900/50">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
            <CardDescription>Destructive actions that affect the entire platform.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between border-b border-red-100 dark:border-red-900/30 pb-4">
              <div>
                <div className="font-medium">Maintenance Mode</div>
                <div className="text-sm text-muted-foreground">Lock out all users except Super Admins.</div>
              </div>
              <Button variant="destructive" size="sm" disabled>Enable</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
