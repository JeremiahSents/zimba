import { HugeiconsIcon } from "@hugeicons/react"
import {
  Analytics02Icon,
  DashboardSquare02Icon,
  Invoice02Icon,
  MoneyBag02Icon,
} from "@hugeicons/core-free-icons"

import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ExpenseTable } from "@/components/dashboard/shared/expense-table"
import { SpendBarChart } from "@/components/dashboard/features/overview/spend-bar-chart"
import { UtilizationAreaChart } from "@/components/dashboard/features/overview/utilization-area-chart"
import type { DashboardOverviewData } from "@/lib/zimba/types"

const statIcons = [
  DashboardSquare02Icon,
  MoneyBag02Icon,
  Invoice02Icon,
  Analytics02Icon,
]

const statFilters = [
  "All projects",
  "This month",
  "Budget risk",
  "Pending approvals",
]

export function DashboardPage({ data }: { data: DashboardOverviewData }) {
  return (
    <DashboardShell
      title="Dashboard"
      subtitle="Track budgets, spend, and approvals."
      dataSource={data.source}
    >
      <StatsGrid data={data} />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SpendBarChart data={data.spendChart} />
        </div>
        <div className="lg:col-span-1">
          <UtilizationAreaChart data={data.utilizationChart} />
        </div>
      </div>

      <div className="mt-6">
        <RecentExpenses data={data} />
      </div>
    </DashboardShell>
  )
}

function StatsGrid({ data }: { data: DashboardOverviewData }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between pb-2">
        <h2 className="font-heading text-lg font-semibold tracking-tight">
          Overview
        </h2>
        <Tabs defaultValue={statFilters[0]} className="w-auto">
          <TabsList>
            {statFilters.map((filter) => (
              <TabsTrigger key={filter} value={filter}>
                {filter}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.stats.map((stat, index) => (
          <Card key={stat.label} className="p-5">
            <div className="flex items-center gap-2">
              <HugeiconsIcon
                icon={statIcons[index] ?? DashboardSquare02Icon}
                strokeWidth={2}
                className="size-4 text-muted-foreground"
              />
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>

            <div className="mt-3">
              <p className="font-heading text-2xl font-semibold tracking-tight">
                {stat.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {stat.detail}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

function RecentExpenses({ data }: { data: DashboardOverviewData }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Recent expenses</CardTitle>
        <Button size="sm">Log expense</Button>
      </CardHeader>
      <CardContent>
        <ExpenseTable expenses={data.expenses} />
      </CardContent>
    </Card>
  )
}
