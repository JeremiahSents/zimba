import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
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

import {
  dashboardStats,
  expenses,
  projects,
  roles,
  suppliers,
} from "@/components/dashboard/data"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"

const expenseFilters = ["All expenses", "This week", "Labour", "Materials"]
const supplierFilters = ["All suppliers", "Top paid", "Materials", "Services"]
const reportFilters = ["Monthly", "Budget", "Suppliers", "Export-ready"]

export function ExpensesPage() {
  return (
    <DashboardShell
      title="Expenses"
      subtitle="Review payments, tasks, suppliers, and site spend."
    >
      <FilterRow title="Expense log" filters={expenseFilters} />
      <SummaryStrip
        items={[
          ["This month", dashboardStats[2]?.value ?? "UGX 624M"],
          ["Pending approval", "UGX 42M"],
          ["Largest item", "UGX 18.4M"],
        ]}
      />
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
                <TableRow
                  key={`${expense.date}-${expense.project}-${expense.item}`}
                >
                  <TableCell className="text-muted-foreground">
                    {expense.date}
                  </TableCell>
                  <TableCell className="font-medium">
                    {expense.project}
                  </TableCell>
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
    </DashboardShell>
  )
}

export function SuppliersPage() {
  return (
    <DashboardShell
      title="Suppliers"
      subtitle="Track vendor spend, payment volume, and current exposure."
    >
      <FilterRow title="Supplier network" filters={supplierFilters} />
      <div className="grid gap-4 lg:grid-cols-3">
        {suppliers.map((supplier) => (
          <Card key={supplier.name} className="shadow-none">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar className="size-10">
                    <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                      {initials(supplier.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <CardTitle className="truncate">{supplier.name}</CardTitle>
                    <CardDescription>{supplier.payments}</CardDescription>
                  </div>
                </div>
                <Badge variant="outline">Active</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Paid this month</p>
                <p className="font-heading text-2xl font-semibold">
                  {supplier.amount}
                </p>
              </div>
              <Progress value={supplier.name === "Prime Cement" ? 74 : 52} />
              <p className="text-sm text-muted-foreground">
                Next payment review scheduled with project accountant.
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Supplier activity</CardTitle>
          <CardDescription>Recent project-linked transactions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {expenses.slice(0, 3).map((expense) => (
            <ActivityRow
              key={`${expense.supplier}-${expense.date}`}
              title={expense.supplier}
              detail={`${expense.project} - ${expense.item}`}
              value={expense.amount}
            />
          ))}
        </CardContent>
      </Card>
    </DashboardShell>
  )
}

export function TeamPage() {
  const members: [string, string, string][] = [
    ["Musa Byaruhanga", roles[0] ?? "Owner / Admin", "Approves budgets"],
    ["Amina Kato", roles[1] ?? "Site manager", "Logs site expenses"],
    ["Daniel Okello", roles[2] ?? "Accountant", "Reviews payments"],
  ]

  return (
    <DashboardShell
      title="Team"
      subtitle="Manage project roles, approvals, and access levels."
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {members.map(([name, role, responsibility]) => (
          <Card key={name} className="shadow-none">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Avatar className="size-11">
                  <AvatarFallback className="bg-muted text-sm font-semibold">
                    {initials(name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{name}</CardTitle>
                  <CardDescription>{role}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{responsibility}</p>
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

export function ReportsPage() {
  return (
    <DashboardShell
      title="Reports"
      subtitle="Summarize budget performance and export project updates."
    >
      <FilterRow title="Report center" filters={reportFilters} />
      <div className="grid gap-4 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.name} className="shadow-none">
            <CardHeader>
              <CardTitle>{project.name}</CardTitle>
              <CardDescription>
                {project.location} - {project.plotSize}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Budget</p>
                  <p className="font-semibold">{project.budget}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Remaining</p>
                  <p className="font-semibold">{project.remaining}</p>
                </div>
              </div>
              <Progress value={project.progress} />
              <Button variant="outline" className="w-full">
                Prepare report
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <SummaryStrip
        items={[
          ["Budget utilization", "44%"],
          ["Projects on track", "2 of 3"],
          ["Review required", "Entebbe Villas"],
        ]}
      />
    </DashboardShell>
  )
}

export function SettingsPage() {
  return (
    <DashboardShell
      title="Settings"
      subtitle="Configure company profile, notifications, and permissions."
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <section className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company profile</CardTitle>
              <CardDescription>
                Details shown across project reports and approvals.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <SettingField label="Company" value="Zimba Consultants" />
              <SettingField label="Currency" value="UGX" />
              <SettingField label="Default region" value="Kampala" />
              <SettingField label="Fiscal period" value="Monthly" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Notification preferences</CardTitle>
              <CardDescription>
                Alerts that should appear in the dashboard header.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ActivityRow
                title="Budget risk"
                detail="Notify when a project crosses 80% spend."
                value="On"
              />
              <ActivityRow
                title="Pending approvals"
                detail="Notify admins when payments wait longer than 24h."
                value="On"
              />
              <ActivityRow
                title="Weekly report"
                detail="Send Monday project spend summaries."
                value="Draft"
              />
            </CardContent>
          </Card>
        </section>
        <aside>
          <Card>
            <CardHeader>
              <CardTitle>Role access</CardTitle>
              <CardDescription>Current dashboard permission groups.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {roles.map((role) => (
                <div
                  key={role}
                  className="py-2"
                >
                  <p className="font-medium">{role}</p>
                  <p className="text-sm text-muted-foreground">
                    Can view assigned projects and payment context.
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </aside>
      </div>
    </DashboardShell>
  )
}

function FilterRow({
  title,
  filters,
}: {
  title: string
  filters: string[]
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="font-heading text-lg font-semibold tracking-tight">
        {title}
      </h2>
      <div className="flex flex-wrap items-center gap-4">
        {filters.map((filter, index) => (
          <button
            key={filter}
            className={`text-sm transition-colors ${
              index === 0
                ? "font-semibold text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  )
}

function SummaryStrip({ items }: { items: [string, string][] }) {
  return (
    <div className="grid gap-8 sm:grid-cols-3">
      {items.map(([label, value], index) => (
        <div key={label}>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 font-heading text-2xl font-semibold tracking-tight">
            {value}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {index === 0 ? "Current period" : "Needs attention"}
          </p>
        </div>
      ))}
    </div>
  )
}

function ActivityRow({
  title,
  detail,
  value,
}: {
  title: string
  detail: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div className="min-w-0">
        <p className="truncate font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{detail}</p>
      </div>
      <p className="shrink-0 text-sm font-semibold">{value}</p>
    </div>
  )
}

function SettingField({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-2">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  )
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase()
}
