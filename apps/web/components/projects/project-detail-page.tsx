"use client"

import {
  Analytics02Icon,
  FolderKanbanIcon,
  MoneyBag02Icon,
  Wallet02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  type ChartConfig,
  ChartContainer,
} from "@workspace/ui/components/chart"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Progress } from "@workspace/ui/components/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import Link from "next/link"
import { notFound } from "next/navigation"
import { useEffect, useState } from "react"
import { Cell, Pie, PieChart } from "recharts"
import { ProjectExpensesTable } from "@/components/projects/project-expenses-table"
import { DashboardShell } from "@/components/shared/dashboard-shell"
import { DatePicker } from "@/components/shared/date-picker"
import { formatCurrency, formatPercent, formatShortDate } from "@/lib/format"
import { readStoredProjects } from "@/lib/project-store"
import type { ProjectDetailResponse } from "@/lib/types"

const colors = ["#86efac", "#fcd34d", "#fca5a5", "#93c5fd", "#d8b4fe"]
const taskLegendClasses = [
  "bg-green-50 text-green-700",
  "bg-amber-50 text-amber-700",
  "bg-red-50 text-red-700",
  "bg-blue-50 text-blue-700",
  "bg-violet-50 text-violet-700",
]
const chartConfig: ChartConfig = {
  value: { label: "Spent", color: "var(--primary)" },
}

export function ProjectDetailPageWrapper({
  id,
  initialProject,
}: {
  id: number
  initialProject?: ProjectDetailResponse
}) {
  const [project, setProject] = useState<ProjectDetailResponse | undefined>(
    initialProject
  )
  const [loading, setLoading] = useState(!initialProject)

  useEffect(() => {
    if (!initialProject) {
      const stored = readStoredProjects().find((p) => p.id === id)
      if (stored) {
        setProject({
          ...stored,
          expenses: [],
          tasks: [
            {
              id: 1,
              name: "Materials",
              budget: Math.round(stored.budget * 0.45),
              spent: 0,
              pct: 0,
            },
            {
              id: 2,
              name: "Labour",
              budget: Math.round(stored.budget * 0.3),
              spent: 0,
              pct: 0,
            },
          ],
          suppliers: [],
        })
      }
      setLoading(false)
    }
  }, [id, initialProject])

  if (loading)
    return (
      <div className="animate-pulse p-8 text-center text-muted-foreground">
        Loading project...
      </div>
    )
  if (!project) return notFound()

  return <ProjectDetailPage project={project} />
}

export function ProjectDetailPage({
  project,
}: {
  project: ProjectDetailResponse
}) {
  const [expenses, setExpenses] = useState(project.expenses)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    task_name: project.tasks[0]?.name ?? "Materials",
    supplier_name: "",
    item_description: "",
    amount: "",
  })
  const [upcoming, setUpcoming] = useState([
    {
      id: 1,
      name: "Cement delivery",
      contractor: "Prime Cement",
      item: "50 bags of cement",
      date: "2026-07-28",
      amount: 15_000_000,
    },
    {
      id: 2,
      name: "Site security",
      contractor: "SecureGuard Uganda",
      item: "Monthly site coverage",
      date: "2026-07-30",
      amount: 2_500_000,
    },
  ])
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [newUpcoming, setNewUpcoming] = useState({
    title: "",
    description: "",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
  })

  const spent = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const taskData = project.tasks
    .map((task) => ({ name: task.name, value: task.spent }))
    .filter((task) => task.value > 0)
  const utilisation = Math.round((spent / project.budget) * 100)
  const budgetHealth = getBudgetHealth(utilisation)
  const remainingPercent = Math.min(Math.max(100 - utilisation, 0), 100)
  const supplierOptions = Array.from(
    new Set([
      ...project.suppliers.map((supplier) => supplier.name),
      ...expenses.map((expense) => expense.supplier_name),
    ])
  ).filter(Boolean)
  const update = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }))

  function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!form.amount || !form.supplier_name || !form.item_description) return
    setExpenses((current) => [
      { ...form, id: Date.now(), amount: Number(form.amount) },
      ...current,
    ])
    setOpen(false)
    setForm((current) => ({
      ...current,
      supplier_name: "",
      item_description: "",
      amount: "",
    }))
  }

  return (
    <DashboardShell
      title={project.name}
      subtitle="Project financial position and delivery tracking."
      dataSource="mock"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-muted-foreground text-xs">
            <Link
              href="/dashboard/projects"
              className="font-semibold text-primary hover:underline"
            >
              Projects
            </Link>
            <span>/</span>
            <span>{project.name}</span>
          </div>
          <h2 className="font-heading font-semibold text-2xl tracking-tight">
            {project.name}
          </h2>
          <p className="mt-1 text-muted-foreground text-xs">
            {project.location}
            {project.plot_size ? ` · ${project.plot_size}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Share
          </Button>
          <Button onClick={() => setOpen(true)} size="sm">
            + New expense
          </Button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Metric
          label="Total budget"
          value={formatCurrency(project.budget)}
          detail="Baseline"
          icon="budget"
          pillClassName="bg-blue-50 text-blue-700"
        />
        <Metric
          label="Total spent"
          value={formatCurrency(spent)}
          detail="Spent"
          icon="spent"
          pillClassName="bg-amber-50 text-amber-700"
        />
        <Metric
          label="Remaining budget"
          value={formatCurrency(Math.max(project.budget - spent, 0))}
          detail={`${formatPercent(Math.max(100 - utilisation, 0))} left`}
          icon="remaining"
          pillClassName="bg-green-50 text-green-700"
        />
        <Metric
          label="Utilization"
          value={formatPercent(utilisation)}
          detail={utilisation <= 80 ? "On track" : "Attention"}
          icon="utilization"
          pillClassName={budgetHealth.pill}
        />
      </div>
      <div className="mb-6 grid items-stretch gap-4 lg:grid-cols-[1.35fr_1fr]">
        <Card className="h-full">
          <CardContent className="flex h-full flex-col justify-between gap-6">
            <div>
              <div className="flex items-center justify-between gap-4">
                <p className="font-medium text-muted-foreground text-xs">
                  Budget health
                </p>
                <span
                  className={`rounded-lg px-2 py-0.5 font-medium text-[10px] ${budgetHealth.pill}`}
                >
                  {budgetHealth.label}
                </span>
              </div>
              <div className="mt-5 flex items-end justify-between gap-4">
                <div>
                  <p className="font-heading font-semibold text-xl tabular-nums tracking-tight">
                    {formatCurrency(Math.max(project.budget - spent, 0))}
                  </p>
                  <p className="mt-1 text-muted-foreground text-xs">
                    remaining from {formatCurrency(project.budget)}
                  </p>
                </div>
                <span
                  className={`rounded-lg px-2 py-0.5 font-semibold text-xs ${budgetHealth.pill}`}
                >
                  {formatPercent(utilisation)} used
                </span>
              </div>
              <Progress
                value={remainingPercent}
                className={`mt-5 [&_[data-slot=progress-indicator]]:ml-auto ${budgetHealth.progress}`}
              />
            </div>
            <div className="grid grid-cols-2 gap-5 border-t pt-4">
              <div>
                <p className="font-medium text-muted-foreground text-xs">
                  Spent
                </p>
                <p className="mt-1 font-heading font-semibold text-base tabular-nums tracking-tight">
                  {formatCurrency(spent)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium text-muted-foreground text-xs">
                  Remaining
                </p>
                <p className="mt-1 font-heading font-semibold text-base tabular-nums tracking-tight">
                  {formatCurrency(Math.max(project.budget - spent, 0))}
                </p>
              </div>
            </div>
            <p className="text-muted-foreground text-xs">
              {project.location}
              {project.plot_size ? ` · ${project.plot_size}` : ""}
            </p>
          </CardContent>
        </Card>

        <Card className="flex h-full min-w-0 flex-col">
          <CardContent className="grid flex-1 items-center gap-5 sm:grid-cols-[9rem_minmax(0,1fr)]">
            <div className="relative flex aspect-square w-full max-w-[12rem] shrink-0 items-center justify-center justify-self-center sm:justify-self-start">
              <ChartContainer
                config={chartConfig}
                className="absolute inset-0 aspect-auto h-full w-full"
              >
                <PieChart>
                  <Pie
                    data={taskData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="60%"
                    outerRadius="88%"
                    strokeWidth={0}
                    paddingAngle={2}
                  >
                    {taskData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={colors[index % colors.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
              <div className="pointer-events-none z-10 flex flex-col items-center justify-center text-center">
                <span className="font-medium text-[10px] text-muted-foreground uppercase tracking-wide">
                  Spent
                </span>
              </div>
            </div>
            <div className="grid min-w-0 content-center gap-2.5">
              {taskData.map((task, index) => (
                <div
                  key={task.name}
                  className="flex min-w-0 items-center gap-3"
                >
                  <span
                    className={`truncate rounded-lg px-2 py-1 font-medium text-[10px] ${taskLegendClasses[index % taskLegendClasses.length]}`}
                  >
                    {task.name}
                  </span>
                  <span className="ml-auto shrink-0 font-semibold text-muted-foreground text-xs">
                    {formatPercent((task.value / Math.max(spent, 1)) * 100)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <TaskExpenseSection tasks={project.tasks} />

      <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
        <Card className="flex min-h-0 flex-col">
          <CardHeader>
            <CardTitle>Expenses</CardTitle>
            <CardDescription>
              Every payment recorded against this project.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ProjectExpensesTable expenses={expenses} />
          </CardContent>
        </Card>

        <Card className="flex h-full flex-col overflow-hidden">
          <CardHeader className="border-b">
            <CardTitle>Payment notifications</CardTitle>
            <CardDescription>Payments awaiting review.</CardDescription>
            <CardAction>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-lg border-primary bg-primary text-primary-foreground hover:bg-primary/85 hover:text-primary-foreground"
                onClick={() => setPaymentDialogOpen(true)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="M12 5v14" />
                </svg>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <div className="flex flex-col divide-y divide-border">
              {upcoming.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 px-5 py-4 transition-colors hover:bg-muted/40"
                >
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-amber-500" />
                  <div className="min-w-0 flex-1">
                    <span className="block font-medium text-sm">
                      {item.name}
                    </span>
                    <p className="mt-1 text-muted-foreground text-xs leading-5">
                      {item.contractor} · {item.item}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="block text-muted-foreground text-xs">
                      Due {formatShortDate(item.date)}
                    </span>
                    <span className="mt-1 block font-semibold text-foreground text-sm">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                </div>
              ))}
              {upcoming.length === 0 && (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  No upcoming payments.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add upcoming payment</DialogTitle>
            <DialogDescription>
              Record a planned payment for {project.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-5 grid gap-4">
            <label className="grid gap-2">
              <Label>Title</Label>
              <Input
                value={newUpcoming.title}
                onChange={(event) =>
                  setNewUpcoming({ ...newUpcoming, title: event.target.value })
                }
                placeholder="e.g. Cement delivery"
              />
            </label>
            <label className="grid gap-2">
              <Label>Description</Label>
              <Input
                value={newUpcoming.description}
                onChange={(event) =>
                  setNewUpcoming({
                    ...newUpcoming,
                    description: event.target.value,
                  })
                }
                placeholder="e.g. 50 bags of cement"
              />
            </label>
            <label className="grid gap-2">
              <Label>Amount (UGX)</Label>
              <Input
                type="number"
                value={newUpcoming.amount}
                onChange={(event) =>
                  setNewUpcoming({ ...newUpcoming, amount: event.target.value })
                }
                placeholder="0"
              />
            </label>
            <label className="grid gap-2">
              <Label>Payment date</Label>
              <DatePicker
                value={newUpcoming.date}
                onChange={(date) => setNewUpcoming({ ...newUpcoming, date })}
              />
            </label>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setPaymentDialogOpen(false)
                setNewUpcoming({
                  title: "",
                  description: "",
                  amount: "",
                  date: new Date().toISOString().slice(0, 10),
                })
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (
                  !newUpcoming.title ||
                  !newUpcoming.description ||
                  !newUpcoming.amount ||
                  !newUpcoming.date
                )
                  return
                setUpcoming([
                  {
                    id: Date.now(),
                    name: newUpcoming.title,
                    contractor: "Contractor pending",
                    item: newUpcoming.description,
                    amount: Number(newUpcoming.amount),
                    date: newUpcoming.date,
                  },
                  ...upcoming,
                ])
                setPaymentDialogOpen(false)
                setNewUpcoming({
                  title: "",
                  description: "",
                  amount: "",
                  date: new Date().toISOString().slice(0, 10),
                })
              }}
            >
              Add payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add an expense</DialogTitle>
            <DialogDescription>
              Log a payment for {project.name}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="grid gap-4">
            <Field
              label="Expense name"
              value={form.item_description}
              onChange={(v) => update("item_description", v)}
              placeholder="e.g. Cement – 50 bags"
            />
            <label className="grid gap-2">
              <Label>Supplier</Label>
              <Select
                value={form.supplier_name}
                onValueChange={(value) => update("supplier_name", value ?? "")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {supplierOptions.length ? (
                    supplierOptions.map((supplier) => (
                      <SelectItem key={supplier} value={supplier}>
                        {supplier}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="new-supplier">New supplier</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </label>
            <Field
              label="Amount (UGX)"
              value={form.amount}
              onChange={(v) => update("amount", v)}
              placeholder="0"
              type="number"
            />
            <label className="grid gap-2">
              <Label>Category</Label>
              <Select
                value={form.task_name}
                onValueChange={(value) => update("task_name", value ?? "")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {project.tasks.map((task) => (
                    <SelectItem key={task.id} value={task.name}>
                      {task.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save expense</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  )
}

function Metric({
  label,
  value,
  detail,
  icon,
  pillClassName,
}: {
  label: string
  value: string
  detail: string
  icon: "budget" | "spent" | "remaining" | "utilization"
  pillClassName: string
}) {
  const icons = {
    budget: Wallet02Icon,
    spent: MoneyBag02Icon,
    remaining: FolderKanbanIcon,
    utilization: Analytics02Icon,
  }

  return (
    <Card className="flex flex-row items-center justify-between gap-4 p-5">
      <div>
        <div className="flex items-center gap-2">
          <p className="font-medium text-muted-foreground text-xs">{label}</p>
          <HugeiconsIcon
            icon={icons[icon]}
            strokeWidth={1.8}
            className="size-4 text-primary"
          />
        </div>
        <p className="mt-2 font-heading font-semibold text-xl tabular-nums tracking-tight">
          {value}
        </p>
      </div>
      <p
        className={`shrink-0 whitespace-nowrap rounded-lg px-1.5 py-0.5 text-right font-medium text-[10px] ${pillClassName}`}
      >
        {detail}
      </p>
    </Card>
  )
}

function TaskExpenseSection({
  tasks,
}: {
  tasks: ProjectDetailResponse["tasks"]
}) {
  return (
    <section className="mb-6">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-semibold text-base tracking-tight">
            By project task
          </h2>
          <p className="mt-1 text-muted-foreground text-xs">
            Expenses against the budget assigned to each task.
          </p>
        </div>
      </div>
      <div className="grid gap-2">
        {tasks.map((task, index) => {
          const taskSpent = task.spent
          const percentage = task.budget
            ? Math.min((taskSpent / task.budget) * 100, 100)
            : 0
          const budgetHealth = getBudgetHealth(percentage)
          const remainingPercent = Math.max(100 - percentage, 0)
          return (
            <div
              key={task.id}
              className="grid items-center gap-3 rounded-lg border border-border/70 bg-card px-4 py-3 sm:grid-cols-[minmax(9rem,0.85fr)_minmax(10rem,1.6fr)_minmax(12rem,1fr)]"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className="size-3 shrink-0 rounded-full"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <div className="min-w-0">
                  <span className="block truncate font-medium text-sm">
                    {task.name}
                  </span>
                  <span
                    className={`mt-1 inline-flex rounded-lg px-1.5 py-0.5 font-medium text-[10px] ${budgetHealth.pill}`}
                  >
                    {budgetHealth.label}
                  </span>
                </div>
              </div>
              <Progress
                value={remainingPercent}
                className={`h-1.5 [&_[data-slot=progress-indicator]]:ml-auto ${budgetHealth.progress}`}
              />
              <p className="text-right text-muted-foreground text-xs tabular-nums">
                <span className="font-semibold text-foreground">
                  {formatCurrency(taskSpent)}
                </span>{" "}
                of {formatCurrency(task.budget)}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function getBudgetHealth(percentageUsed: number) {
  if (percentageUsed >= 80) {
    return {
      label: "Critical",
      pill: "bg-red-50 text-red-600",
      progress: "[&_[data-slot=progress-indicator]]:bg-red-500",
    }
  }
  if (percentageUsed >= 60) {
    return {
      label: "Watch",
      pill: "bg-amber-50 text-amber-600",
      progress: "[&_[data-slot=progress-indicator]]:bg-amber-500",
    }
  }
  return {
    label: "On track",
    pill: "bg-green-50 text-green-600",
    progress: "[&_[data-slot=progress-indicator]]:bg-green-500",
  }
}

function Field({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <label className="grid gap-2">
      <Label>{label}</Label>
      <Input
        required
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  )
}
