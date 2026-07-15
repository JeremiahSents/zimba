import { UserAdd01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { DashboardShell } from "@/components/shared/dashboard-shell"
import { TeamTable } from "@/components/team/team-table"
import { mockTeamMembers } from "@/lib/api/mock-data"

export function TeamPage() {
  const stats = [
    ["Team members", String(mockTeamMembers.length), "With dashboard access"],
    ["Approvers", "2", "Owner and accountant roles"],
    ["Open reviews", "3", "Items awaiting action"],
  ]
  return (
    <DashboardShell
      title="Team"
      subtitle="Manage project roles, approvals, and access levels."    >
      <Card className="gap-0 py-0">
        <div className="grid grid-cols-2 md:grid-cols-3 [&>*:first-child]:col-span-2 md:[&>*:first-child]:col-span-1">
          {stats.map(([label, value, detail]) => (
            <div
              key={label}
              className="border-t p-4 first:border-t-0 even:border-l md:border-t-0 md:border-l md:p-5 md:first:border-l-0"
            >
              <p className="font-medium text-foreground text-xs">{label}</p>
              <p className="mt-5 font-heading font-semibold text-base text-foreground">
                {value}
              </p>
              <p className="mt-1 text-[10px] text-muted-foreground">{detail}</p>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <CardHeader className="flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <CardTitle>Team access</CardTitle>
            <CardDescription>
              Roles and responsibilities across the dashboard.
            </CardDescription>
          </div>
          <Button size="sm">
            <HugeiconsIcon icon={UserAdd01Icon} strokeWidth={1.5} />
            Invite member
          </Button>
        </CardHeader>
        <CardContent>
          <TeamTable members={mockTeamMembers} />
        </CardContent>
      </Card>
    </DashboardShell>
  )
}
