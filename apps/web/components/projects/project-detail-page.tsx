"use client"

import {
  FolderKanbanIcon,
  MoneyBag02Icon,
  Wallet02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
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
import Link from "next/link"
import { notFound } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { Cell, Pie, PieChart } from "recharts"
import { ProjectExpensesTable } from "@/components/projects/project-expenses-table"
import { DashboardShell } from "@/components/shared/dashboard-shell"
import { DatePicker } from "@/components/shared/date-picker"
import { mergeStoredExpenses, storeExpenseStatus } from "@/lib/expense-store"
import { formatCurrency, formatPercent } from "@/lib/format"
import { readStoredProjects } from "@/lib/project-store"
import type { ExpenseStatus, ProjectDetailResponse } from "@/lib/types"

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
const metricIcons = {
  budget: Wallet02Icon,
  spent: MoneyBag02Icon,
  remaining: FolderKanbanIcon,
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

  useEffect(() => {
    setExpenses(mergeStoredExpenses(project.id, project.expenses))
  }, [project.id, project.expenses])

  const updateExpenseStatus = useCallback(
    (expenseId: number, status: ExpenseStatus) => {
      setExpenses((current) =>
        current.map((expense) =>
          expense.id === expenseId ? { ...expense, status } : expense
        )
      )
      storeExpenseStatus(project.id, expenseId, status)
    },
    [project.id]
  )

  const spent = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const taskData = project.tasks
    .map((task) => ({ name: task.name, value: task.spent }))
    .filter((task) => task.value > 0)
  const utilisation = Math.round((spent / project.budget) * 100)
  const budgetHealth = getBudgetHealth(utilisation)

  return (
    <DashboardShell
      title={project.name}
      subtitle="Project financial position and delivery tracking."
      dataSource="mock"
      notifications={upcoming}
      onAddNotification={() => setPaymentDialogOpen(true)}
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-muted-foreground text-xs">
            <Link
              href="/admin/projects"
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
        <Button
          size="sm"
          nativeButton={false}
          render={<Link href={`/admin/projects/${project.id}/expenses/new`} />}
        >
          + New expense
        </Button>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Metric
          label="Total budget"
          value={formatCurrency(project.budget)}
          icon="budget"
        />
        <Metric
          label="Total spent"
          value={formatCurrency(spent)}
          detail={`${formatPercent(utilisation)} used`}
          icon="spent"
          pillClassName={budgetHealth.pill}
        />
        <Metric
          label="Remaining budget"
          value={formatCurrency(Math.max(project.budget - spent, 0))}
          detail={`${formatPercent(Math.max(100 - utilisation, 0))} left`}
          icon="remaining"
          pillClassName="bg-green-50 text-green-700"
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
                value={utilisation}
                className={`mt-5 ${budgetHealth.progress}`}
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

      <div>
        <section className="flex min-h-0 flex-col pt-1">
          <div className="mb-4">
            <h2 className="font-heading font-semibold text-base tracking-tight">
              Expenses
            </h2>
            <p className="mt-1 text-muted-foreground text-xs">
              Every payment recorded against this project.
            </p>
          </div>
          <ProjectExpensesTable
            expenses={expenses}
            onStatusChange={updateExpenseStatus}
          />
        </section>
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
  detail?: string
  icon: "budget" | "spent" | "remaining"
  pillClassName?: string
}) {
  return (
    <Card className="flex flex-row items-center justify-between gap-4 p-5">
      <div>
        <div className="flex items-center gap-2">
          <p className="font-medium text-muted-foreground text-xs">{label}</p>
          <HugeiconsIcon
            icon={metricIcons[icon]}
            strokeWidth={1.8}
            className="size-4 text-primary"
          />
        </div>
        <p className="mt-2 font-heading font-semibold text-xl tabular-nums tracking-tight">
          {value}
        </p>
      </div>
      {detail && (
        <p
          className={`shrink-0 whitespace-nowrap rounded-lg px-1.5 py-0.5 text-right font-medium text-[10px] ${pillClassName}`}
        >
          {detail}
        </p>
      )}
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
                value={percentage}
                className={`h-1.5 ${budgetHealth.progress}`}
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
