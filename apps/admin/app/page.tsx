import type { Metadata } from "next"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { Separator } from "@workspace/ui/components/separator"

import { AdminShell } from "@/components/admin-shell"

export const metadata: Metadata = {
  title: "Zimba Admin",
  description:
    "Super admin dashboard for managing organizations, users, roles, billing, and system health.",
}

const metrics = [
  {
    label: "Organizations",
    value: "128",
    detail: "+12 this week",
  },
  {
    label: "Active users",
    value: "4,812",
    detail: "+8.1% vs last week",
  },
  {
    label: "Open flags",
    value: "9",
    detail: "3 require review",
  },
  {
    label: "System uptime",
    value: "99.98%",
    detail: "Last 30 days",
  },
]

const incidents = [
  {
    actor: "A. Mensah",
    action: "Approved org provisioning",
    target: "North Ridge Construction",
    time: "2m ago",
    status: "Done",
  },
  {
    actor: "M. Chen",
    action: "Escalated billing exception",
    target: "Vertex Homes",
    time: "18m ago",
    status: "Review",
  },
  {
    actor: "System",
    action: "Synced audit logs",
    target: "Global event stream",
    time: "1h ago",
    status: "Done",
  },
  {
    actor: "J. Patel",
    action: "Revoked dormant access",
    target: "Former contractor account",
    time: "3h ago",
    status: "Done",
  },
]

export default function Page() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="grid gap-6 xl:grid-cols-[1.45fr_0.85fr]">
          <Card className="overflow-hidden">
            <CardHeader className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">Control center</Badge>
                <Badge variant="secondary">Live</Badge>
              </div>
              <div>
                <CardTitle className="text-3xl font-semibold tracking-tight">
                  Super admin oversight in one place
                </CardTitle>
                <CardDescription className="mt-2 max-w-2xl text-base">
                  Manage organizations, permissions, billing, escalations, and platform health without jumping between tools.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground">Priority queue</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight">14</p>
                <p className="mt-1 text-sm text-muted-foreground">Items need attention today</p>
              </div>
              <div className="rounded-3xl border bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground">Escalations</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight">3</p>
                <p className="mt-1 text-sm text-muted-foreground">One billing, two access reviews</p>
              </div>
              <div className="rounded-3xl border bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground">Response time</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight">6m</p>
                <p className="mt-1 text-sm text-muted-foreground">Median time to resolution</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System pulse</CardTitle>
              <CardDescription>Operational status across the platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-3 rounded-2xl border bg-background p-3">
                <div>
                  <p className="font-medium">API layer</p>
                  <p className="text-sm text-muted-foreground">Healthy across all regions</p>
                </div>
                <Badge variant="success">Stable</Badge>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-2xl border bg-background p-3">
                <div>
                  <p className="font-medium">Background jobs</p>
                  <p className="text-sm text-muted-foreground">Processing within normal range</p>
                </div>
                <Badge variant="outline">Normal</Badge>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-2xl border bg-background p-3">
                <div>
                  <p className="font-medium">Security events</p>
                  <p className="text-sm text-muted-foreground">No critical alerts pending</p>
                </div>
                <Badge variant="secondary">Monitored</Badge>
              </div>
              <Button className="w-full" variant="secondary">
                View incident board
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <Card key={metric.label}>
              <CardHeader className="pb-3">
                <CardDescription>{metric.label}</CardDescription>
                <CardTitle className="text-3xl font-semibold tracking-tight">{metric.value}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-sm text-muted-foreground">{metric.detail}</CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
            <div>
              <CardTitle>Recent admin activity</CardTitle>
              <CardDescription>Track the latest actions across the control plane.</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              Open audit log
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Actor</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incidents.map((item) => (
                  <TableRow key={`${item.actor}-${item.action}`}>
                    <TableCell className="font-medium">{item.actor}</TableCell>
                    <TableCell>{item.action}</TableCell>
                    <TableCell>{item.target}</TableCell>
                    <TableCell>{item.time}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={item.status === "Review" ? "secondary" : "outline"}>
                        {item.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Separator />

        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle>Admin launch checklist</CardTitle>
              <CardDescription>Things to wire next as the dashboard grows.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>• Connect organization detail routes and permission management screens.</p>
              <p>• Replace the static metrics with live data from the workspace packages.</p>
              <p>• Add alerting, approvals, and audit export actions to the top bar.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Workspace connection</CardTitle>
              <CardDescription>This app already shares the monorepo UI and type setup.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Uses the shared Tailwind theme from <span className="font-medium text-foreground">@workspace/ui</span>.</p>
              <p>Isolated as its own Next.js app under <span className="font-medium text-foreground">apps/admin</span>.</p>
              <p>Ready for future data wiring through <span className="font-medium text-foreground">@workspace/db</span>.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminShell>
  )
}
