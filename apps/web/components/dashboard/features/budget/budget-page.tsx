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

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ProjectBudgetTable } from "@/components/dashboard/features/budget/project-budget-table"
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
      <Card className="gap-0 py-0">
        <div className="grid md:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="border-t p-5 first:border-t-0 md:border-t-0 md:border-l md:first:border-l-0"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-foreground">
                  {stat.label}
                </p>
                <span className="grid size-9 place-items-center rounded-full bg-primary/10 text-primary">
                  <HugeiconsIcon
                    icon={stat.icon}
                    strokeWidth={2}
                    className="size-4"
                  />
                </span>
              </div>
              <p className="mt-5 font-heading text-3xl font-semibold tracking-tight text-foreground">
                {stat.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {stat.detail}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
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
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Project budgets</CardTitle>
            <CardDescription>
              Allocation and utilization by individual project.
            </CardDescription>
          </div>
          <Button size="sm">
            <HugeiconsIcon icon={WalletAdd01Icon} strokeWidth={2} />
            Set up budget
          </Button>
        </CardHeader>
        <CardContent>
          <ProjectBudgetTable projects={data.projects} />
        </CardContent>
      </Card>
    </DashboardShell>
  )
}
