import { Button } from "@workspace/ui/components/button"
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet"

import {
  dashboardStats,
  expenses,
  projects,
  suppliers,
} from "@/components/dashboard/data"
import { DashboardSidebar } from "@/components/dashboard/sidebar"

export function DashboardPage() {
  return (
    <div className="min-h-svh bg-background text-foreground md:grid md:grid-cols-[15rem_1fr]">
      <div className="hidden md:block">
        <DashboardSidebar />
      </div>

      <main className="min-w-0 overflow-hidden">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
          <DashboardTopbar />
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
        </div>
      </main>
    </div>
  )
}

function DashboardTopbar() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger render={<Button variant="outline" size="sm" />}>
              Menu
            </SheetTrigger>
            <SheetContent side="left" className="w-72 border-0 bg-sidebar p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Dashboard navigation</SheetTitle>
              </SheetHeader>
              <DashboardSidebar />
            </SheetContent>
          </Sheet>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Construction finance overview
          </p>
          <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            Dashboard
          </h1>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline">+ New project</Button>
        <Button>+ New expense</Button>
      </div>
    </div>
  )
}

function StatsGrid() {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {dashboardStats.map((stat) => (
        <Card key={stat.label}>
          <CardHeader>
            <CardDescription className="font-semibold uppercase tracking-wide">
              {stat.label}
            </CardDescription>
            <CardTitle className="text-2xl font-semibold">{stat.value}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{stat.detail}</p>
          </CardContent>
        </Card>
      ))}
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
          <Card key={project.name} size="sm" className="bg-background/50">
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
            className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3"
          >
            <div>
              <p className="font-medium">{supplier.name}</p>
              <p className="text-sm text-muted-foreground">{supplier.payments}</p>
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
