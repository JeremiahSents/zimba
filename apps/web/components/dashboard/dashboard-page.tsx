import { HugeiconsIcon } from "@hugeicons/react"
import {
  Analytics02Icon,
  DashboardSquare02Icon,
  Invoice02Icon,
  MoneyBag02Icon,
} from "@hugeicons/core-free-icons"

import { Progress } from "@workspace/ui/components/progress"
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
  projects,
  suppliers,
} from "@/components/dashboard/data"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"

export function DashboardPage() {
  return (
    <DashboardShell
      title="Dashboard"
      subtitle="Track budgets, spend, and approvals."
    >
      <StatsGrid />

      <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
        <section className="space-y-6">
          <ProjectOverview />
          <RecentExpenses />
        </section>
        <aside className="space-y-6">
          <SupplierSummary />
          <ActivityCard />
        </aside>
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

function ProjectOverview() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Project spend</CardTitle>
        <Button variant="outline" size="sm">View details</Button>
      </CardHeader>
      <CardContent>
        {/* Placeholder for Graph */}
        <div className="mb-6 h-[200px] w-full rounded-md bg-muted/30 flex items-center justify-center border border-border border-dashed">
          <span className="text-sm text-muted-foreground flex items-center gap-2">
            <HugeiconsIcon icon={Analytics02Icon} className="size-4" />
            Spend Analysis Chart
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {projects.map((project) => (
            <div key={project.name} className="space-y-4 rounded-xl border border-border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-heading text-base font-medium">{project.name}</p>
                </div>
                <span className={`text-xs font-medium ${
                  project.status === "On track" ? "text-primary" : "text-muted-foreground"
                }`}>
                  {project.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Budget</p>
                  <p className="font-semibold">{project.budget}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Spent</p>
                  <p className="font-semibold">{project.spent}</p>
                </div>
              </div>
              <Progress value={project.progress} className="[&_[data-slot=progress-track]]:h-1.5" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Remaining</span>
                <span className="font-semibold">{project.remaining}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
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

function SupplierSummary() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Top suppliers</CardTitle>
        <Button variant="ghost" size="icon-sm"><HugeiconsIcon icon={DashboardSquare02Icon} className="size-4" /></Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {suppliers.map((supplier) => (
            <div
              key={supplier.name}
              className="flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{supplier.name}</p>
                <p className="text-xs text-muted-foreground">{supplier.payments}</p>
              </div>
              <p className="text-sm font-semibold">{supplier.amount}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ActivityCard() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Today</CardTitle>
        <Button variant="outline" size="sm">Approve all</Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-sm">
          <div className="flex gap-3">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
            <p className="text-muted-foreground">
              Site manager logged a concrete delivery for{" "}
              <span className="font-medium text-foreground">Nakasero Heights</span>.
            </p>
          </div>
          <div className="flex gap-3">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
            <p className="text-muted-foreground">
              Accountant flagged <span className="font-medium text-foreground">Entebbe Villas</span>{" "}
              for budget review.
            </p>
          </div>
          <div className="flex gap-3">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
            <p className="text-muted-foreground">Two supplier payments are ready for approval.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
