import { HugeiconsIcon } from "@hugeicons/react"
import {
  Analytics02Icon,
  DashboardSquare02Icon,
  Invoice02Icon,
  MoneyBag02Icon,
} from "@hugeicons/core-free-icons"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"

import {
  dashboardStats,
  expenses,
} from "@/components/dashboard/data"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardBarChart } from "@/components/dashboard/dashboard-bar-chart"
import { DashboardAreaChart } from "@/components/dashboard/dashboard-area-chart"

export function DashboardPage() {
  return (
    <DashboardShell
      title="Dashboard"
      subtitle="Track budgets, spend, and approvals."
    >
      <StatsGrid />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DashboardBarChart />
        </div>
        <div className="lg:col-span-1">
          <DashboardAreaChart />
        </div>
      </div>

      <div className="mt-6">
        <RecentExpenses />
      </div>
    </DashboardShell>
  )
}

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

function StatsGrid() {
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
        {dashboardStats.map((stat, index) => (
          <Card key={stat.label} className="p-5">
            <div className="flex items-center gap-2">
              <HugeiconsIcon
                icon={statIcons[index] ?? DashboardSquare02Icon}
                strokeWidth={2}
                className="size-4 text-muted-foreground"
              />
              <p className="text-sm text-muted-foreground">
                {stat.label}
              </p>
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


function RecentExpenses() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Recent expenses</CardTitle>
        <Button size="sm">Log expense</Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Task</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Item</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={`${expense.date}-${expense.project}-${expense.item}`}>
                <TableCell className="text-muted-foreground">{expense.date}</TableCell>
                <TableCell className="font-medium">{expense.project}</TableCell>
                <TableCell>{expense.task}</TableCell>
                <TableCell>{expense.supplier}</TableCell>
                <TableCell>{expense.item}</TableCell>
                <TableCell className="text-right font-semibold">
                  {expense.amount}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
