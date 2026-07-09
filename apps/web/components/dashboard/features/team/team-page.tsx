import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ActivityRow } from "@/components/dashboard/shared/activity-row"
import { initials } from "@/components/dashboard/shared/initials"
import { mockTeamMembers } from "@/lib/zimba/mock-data"

export function TeamPage() {
  return (
    <DashboardShell
      title="Team"
      subtitle="Manage project roles, approvals, and access levels."
      dataSource="mock"
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {mockTeamMembers.map((member) => (
          <Card key={member.name} className="shadow-none">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Avatar className="size-11">
                  <AvatarFallback className="bg-muted text-sm font-semibold">
                    {initials(member.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{member.name}</CardTitle>
                  <CardDescription>{member.role}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {member.responsibility}
              </p>
              <Badge variant="outline">Dashboard access</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Approval queue</CardTitle>
          <CardDescription>Who needs to review current work.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <ActivityRow
            title="Budget variance review"
            detail="Entebbe Villas requires owner sign-off."
            value="Owner"
          />
          <ActivityRow
            title="Supplier payment batch"
            detail="Two payments need accountant confirmation."
            value="Accountant"
          />
          <ActivityRow
            title="Site expense capture"
            detail="Concrete delivery details are ready for validation."
            value="Site manager"
          />
        </CardContent>
      </Card>
    </DashboardShell>
  )
}
