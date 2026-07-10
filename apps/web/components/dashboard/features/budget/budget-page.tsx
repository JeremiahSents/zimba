import { HugeiconsIcon } from "@hugeicons/react"
import {
  AnalyticsUpIcon,
  MoneyBag02Icon,
  Wallet02Icon,
  WalletAdd01Icon,
} from "@hugeicons/core-free-icons"

import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Progress } from "@workspace/ui/components/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { formatCurrency, formatPercent } from "@/lib/zimba/format"
import type { DashboardOverviewData } from "@/lib/zimba/types"

export function BudgetPage({ data }: { data: DashboardOverviewData }) {
  const totalBudget = data.projects.reduce(
    (sum, project) => sum + project.budget,
    0
  )
  const totalSpent = data.projects.reduce(
    (sum, project) => sum + project.spent,
    0
  )
  const remaining = totalBudget - totalSpent
  const utilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

  const stats = [
    {
      label: "Overall budget",
      value: formatCurrency(totalBudget),
      detail: `Across ${data.projects.length} active projects`,
      icon: Wallet02Icon,
    },
    {
      label: "Spent to date",
      value: formatCurrency(totalSpent),
      detail: `${formatPercent(utilization)} of the total allocation`,
      icon: AnalyticsUpIcon,
    },
    {
      label: "Available balance",
      value: formatCurrency(remaining),
      detail: "Remaining across all projects",
      icon: MoneyBag02Icon,
    },
  ]

  return (
    <DashboardShell
      title="Budget"
      subtitle="Set spending limits and keep every project financially on track."
      dataSource={data.source}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-lg font-semibold tracking-tight">
            Budget overview
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            A live view of your company-wide allocation.
          </p>
        </div>
        <Button size="sm">
          <HugeiconsIcon icon={WalletAdd01Icon} strokeWidth={2} />
          Set up budget
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} tone="keylime" className="overflow-hidden">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <span className="grid size-9 place-items-center rounded-full bg-primary/10 text-primary">
                <HugeiconsIcon
                  icon={stat.icon}
                  strokeWidth={2}
                  className="size-4"
                />
              </span>
            </div>
            <p className="mt-5 font-heading text-2xl font-semibold tracking-tight">
              {stat.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{stat.detail}</p>
          </Card>
        ))}
      </div>

      <Card tone="sage">
        <CardHeader>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <CardTitle>Overall utilization</CardTitle>
              <CardDescription>
                Combined spend against the approved portfolio budget.
              </CardDescription>
            </div>
            <p className="font-heading text-3xl font-semibold text-primary">
              {formatPercent(utilization)}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <Progress
            value={utilization}
            className="[&_[data-slot=progress-track]]:h-3"
          />
          <div className="mt-3 flex justify-between text-xs text-muted-foreground">
            <span>{formatCurrency(totalSpent)} spent</span>
            <span>{formatCurrency(totalBudget)} total</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Project budgets</CardTitle>
          <CardDescription>
            Allocation and utilization by individual project.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Allocated</TableHead>
                <TableHead>Spent</TableHead>
                <TableHead>Remaining</TableHead>
                <TableHead className="min-w-44">Utilization</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <p className="font-medium text-foreground">
                      {project.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {project.location}
                    </p>
                  </TableCell>
                  <TableCell>{formatCurrency(project.budget)}</TableCell>
                  <TableCell>{formatCurrency(project.spent)}</TableCell>
                  <TableCell>{formatCurrency(project.remaining)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Progress
                        value={project.pct}
                        className="w-28 shrink-0 [&_[data-slot=progress-track]]:h-2"
                      />
                      <span className="text-xs font-medium tabular-nums">
                        {formatPercent(project.pct)}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardShell>
  )
}
