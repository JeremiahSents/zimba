import { HugeiconsIcon } from "@hugeicons/react"
import {
  Analytics02Icon,
  DashboardSquare02Icon,
  Invoice02Icon,
  MoneyBag02Icon,
} from "@hugeicons/core-free-icons"

import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
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
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-lg font-semibold tracking-tight">
          Overview
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          {statFilters.map((filter, index) => (
            <Badge
              key={filter}
              variant={index === 0 ? "default" : "outline"}
              className="h-8 px-3 text-xs font-medium"
            >
              {filter}
            </Badge>
          ))}
        </div>
      </div>

      <Card className="grid gap-0 overflow-hidden rounded-xl py-0 shadow-none sm:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat, index) => (
          <div
            key={stat.label}
            className="border-border/70 p-5 sm:odd:border-r lg:border-r lg:last:border-r-0"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <HugeiconsIcon
                    icon={statIcons[index] ?? DashboardSquare02Icon}
                    strokeWidth={2}
                    className="size-4"
                  />
                </span>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </p>
              </div>
              <span className="size-1.5 rounded-full bg-border" />
            </div>

            <div className="mt-7">
              <p className="font-heading text-2xl font-semibold tracking-tight">
                {stat.value}
              </p>
              <p className="mt-1 text-xs font-medium text-primary">
                {stat.detail}
              </p>
            </div>
          </div>
        ))}
      </Card>
    </section>
  )
}

function ProjectOverview() {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Project spend</CardTitle>
          <CardDescription>
            Budget usage by active construction project.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.name} size="sm" className="gap-4 border-border/70 shadow-none">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>{project.name}</CardTitle>
                  <CardDescription>
                    {project.location} · {project.plotSize}
                  </CardDescription>
                </div>
                <Badge variant={project.status === "On track" ? "default" : "secondary"}>
                  {project.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
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
              <Progress value={project.progress} />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Remaining</span>
                <span className="font-semibold">{project.remaining}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  )
}

function RecentExpenses() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent expenses</CardTitle>
        <CardDescription>
          Latest payments logged across active projects.
        </CardDescription>
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
      <CardHeader>
        <CardTitle>Top suppliers</CardTitle>
        <CardDescription>Highest paid this month.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {suppliers.map((supplier) => (
          <div
            key={supplier.name}
            className="flex items-center justify-between gap-3 rounded-xl border border-border/70 p-3"
          >
            <div className="flex min-w-0 items-center gap-3">
              <Avatar className="size-9">
                <AvatarFallback className="bg-muted text-xs font-semibold">
                  {supplier.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-medium">{supplier.name}</p>
                <p className="text-sm text-muted-foreground">{supplier.payments}</p>
              </div>
            </div>
            <p className="text-sm font-semibold">{supplier.amount}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function ActivityCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Today</CardTitle>
        <CardDescription>Dummy activity preview.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="flex gap-3">
          <span className="mt-2 size-2 rounded-full bg-primary" />
          <p>
            Site manager logged a concrete delivery for{" "}
            <span className="font-medium">Nakasero Heights</span>.
          </p>
        </div>
        <div className="flex gap-3">
          <span className="mt-2 size-2 rounded-full bg-primary" />
          <p>
            Accountant flagged <span className="font-medium">Entebbe Villas</span>{" "}
            for budget review.
          </p>
        </div>
        <div className="flex gap-3">
          <span className="mt-2 size-2 rounded-full bg-primary" />
          <p>Two supplier payments are ready for approval.</p>
        </div>
      </CardContent>
    </Card>
  )
}
