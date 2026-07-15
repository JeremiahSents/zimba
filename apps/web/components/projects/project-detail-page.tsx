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
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { Cell, Pie, PieChart } from "recharts"
import {
  createUpcomingPaymentAction,
  deleteUpcomingPaymentAction,
  updateExpenseStatusAction,
  updateUpcomingPaymentAction,
} from "@/app/admin/actions"
import { ProjectExpensesTable } from "@/components/projects/project-expenses-table"
import { DashboardShell } from "@/components/shared/dashboard-shell"
import { DatePicker } from "@/components/shared/date-picker"
import { formatCurrency, formatPercent, formatShortDate } from "@/lib/format"
import type {
  DashboardSource,
  ExpenseStatus,
  ProjectDetailResponse,
} from "@/lib/types"

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
  initialProject,
  source,
}: {
  initialProject: ProjectDetailResponse
  source: DashboardSource
}) {
  return <ProjectDetailPage project={initialProject} source={source} />
}

export function ProjectDetailPage({
  project,
  source,
}: {
  project: ProjectDetailResponse
  source: DashboardSource
}) {
  const router = useRouter()
  const [expenses, setExpenses] = useState(project.expenses)
  const [upcomingPayments, setUpcomingPayments] = useState(
    project.upcoming_payments ?? []
  )
  const upcoming = upcomingPayments.map((payment) => ({
    amount: payment.amount,
    contractor: payment.supplier_name ?? "Supplier not assigned",
    date: payment.due_date,
    id: payment.id,
    item: payment.description ?? "Planned payment",
    name: payment.title,
  }))
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [mutationError, setMutationError] = useState("")
  const [savingPayment, setSavingPayment] = useState(false)
  const [newUpcoming, setNewUpcoming] = useState({
    title: "",
    description: "",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
  })

  useEffect(() => {
    setExpenses(project.expenses)
    setUpcomingPayments(project.upcoming_payments ?? [])
  }, [project])

  const updateExpenseStatus = useCallback(
    async (expenseId: number, status: ExpenseStatus) => {
      const previous = expenses
      setExpenses((current) =>
        current.map((expense) =>
          expense.id === expenseId ? { ...expense, status } : expense
        )
      )
      const result = await updateExpenseStatusAction(
        project.id,
        expenseId,
        status
      )
      if (!result.ok) {
        setExpenses(previous)
        setMutationError(result.error)
      } else {
        setMutationError("")
        router.refresh()
      }
    },
    [expenses, project.id, router]
  )

  const spent = project.spent
  const taskData = project.tasks.reduce<Array<{ name: string; value: number }>>(
    (items, task) => {
      if (task.spent > 0) items.push({ name: task.name, value: task.spent })
      return items
    },
    []
  )
  const utilisation = project.pct
  const budgetHealth = getBudgetHealth(utilisation)

  return (
    <DashboardShell
      title={project.name}
      subtitle="Project financial position and delivery tracking."      notifications={upcoming}
      onAddNotification={() => setPaymentDialogOpen(true)}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
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
          className="w-full sm:w-auto"
          nativeButton={false}
          render={<Link href={`/admin/projects/${project.id}/expenses/new`} />}
        >
          + New expense
        </Button>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
        <div className="col-span-2 lg:col-span-1">
          <Metric
            label="Total budget"
            value={formatCurrency(project.budget)}
            icon="budget"
          />
        </div>
        <Metric
          label="Total spent"
          value={formatCurrency(spent)}
          detail={`${formatPercent(utilisation)} used`}
          icon="spent"
          pillClassName={budgetHealth.pill}
        />
        <Metric
          label="Remaining budget"
          value={formatCurrency(project.remaining)}
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
                    {formatCurrency(project.remaining)}
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
                  {formatCurrency(project.remaining)}
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

      <TaskExpenseSection tasks={project.tasks} expenses={expenses} />

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-heading font-semibold text-base tracking-tight">
              Upcoming payments
            </h2>
            <p className="mt-1 text-muted-foreground text-xs">
              Planned commitments for this project.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPaymentDialogOpen(true)}
          >
            + Add payment
          </Button>
        </div>
        <div className="divide-y rounded-xl border">
          {upcomingPayments.map((payment) => (
            <div
              key={payment.id}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm">{payment.title}</p>
                <p className="mt-1 text-muted-foreground text-xs">
                  {payment.supplier_name ?? "Supplier not assigned"} · Due{" "}
                  {formatShortDate(payment.due_date)}
                </p>
              </div>
              <p className="font-heading font-semibold text-sm tabular-nums">
                {formatCurrency(payment.amount)}
              </p>
              <span className="rounded-full bg-muted px-2 py-1 text-[10px] capitalize">
                {payment.status.replaceAll("_", " ")}
              </span>
              <div className="flex gap-2">
                {payment.status === "planned" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      const result = await updateUpcomingPaymentAction(
                        project.id,
                        payment.id,
                        { status: "due" }
                      )
                      if (!result.ok) setMutationError(result.error)
                      else router.refresh()
                    }}
                  >
                    Mark due
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={async () => {
                    const result = await deleteUpcomingPaymentAction(
                      project.id,
                      payment.id
                    )
                    if (!result.ok) setMutationError(result.error)
                    else {
                      setUpcomingPayments((current) =>
                        current.filter((item) => item.id !== payment.id)
                      )
                      router.refresh()
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
          {upcomingPayments.length === 0 && (
            <p className="p-6 text-center text-muted-foreground text-sm">
              No upcoming payments.
            </p>
          )}
        </div>
      </section>

      <div>
        {mutationError && (
          <p className="mb-4 font-medium text-destructive text-xs" role="alert">
            {mutationError}
          </p>
        )}
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
              disabled={savingPayment}
              onClick={async () => {
                if (
                  !newUpcoming.title ||
                  !newUpcoming.description ||
                  !newUpcoming.amount ||
                  !newUpcoming.date
                )
                  return
                setSavingPayment(true)
                const result = await createUpcomingPaymentAction(project.id, {
                  amount: Number(newUpcoming.amount),
                  currency: project.currency ?? "UGX",
                  description: newUpcoming.description,
                  due_date: newUpcoming.date,
                  title: newUpcoming.title,
                })
                if (!result.ok) {
                  setMutationError(result.error)
                  setSavingPayment(false)
                  return
                }
                setPaymentDialogOpen(false)
                setNewUpcoming({
                  title: "",
                  description: "",
                  amount: "",
                  date: new Date().toISOString().slice(0, 10),
                })
                setSavingPayment(false)
                router.refresh()
              }}
            >
              {savingPayment ? "Adding..." : "Add payment"}
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
  expenses,
}: {
  tasks: ProjectDetailResponse["tasks"]
  expenses: ProjectDetailResponse["expenses"]
}) {
  const [expandedTask, setExpandedTask] = useState<number | null>(null)

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
              className="overflow-hidden rounded-lg border border-border/70 bg-card"
            >
              <button
                type="button"
                onClick={() =>
                  setExpandedTask((current) =>
                    current === task.id ? null : task.id
                  )
                }
                aria-expanded={expandedTask === task.id}
                className="grid w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/30 sm:grid-cols-[minmax(9rem,0.85fr)_minmax(10rem,1.6fr)_minmax(12rem,1fr)]"
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
              </button>
              {expandedTask === task.id && (
                <TaskExpenseDetails
                  taskName={task.name}
                  expenses={expenses.filter(
                    (expense) => expense.task_name === task.name
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

function TaskExpenseDetails({
  taskName,
  expenses,
}: {
  taskName: string
  expenses: ProjectDetailResponse["expenses"]
}) {
  const recent = [...expenses]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4)

  return (
    <div className="border-border/70 border-t bg-muted/20 px-4 py-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="font-medium text-[11px] text-muted-foreground uppercase tracking-wide">
          Recent {taskName.toLowerCase()} records
        </p>
        <span className="text-[10px] text-muted-foreground">Last 4</span>
      </div>
      {recent.length === 0 ? (
        <p className="py-3 text-muted-foreground text-xs">
          No expenses recorded yet.
        </p>
      ) : (
        <div className="divide-y divide-border/60 rounded-md border border-border/60 bg-background">
          {recent.map((expense) => {
            const paid =
              expense.status === "Full"
                ? expense.amount
                : expense.status === "Partial"
                  ? expense.amount / 2
                  : 0
            const owed = Math.max(expense.amount - paid, 0)
            return (
              <div
                key={expense.id}
                className="grid gap-2 px-3 py-2.5 text-xs sm:grid-cols-[1.25fr_0.7fr_0.8fr_0.8fr] sm:items-center"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {expense.supplier_name}
                  </p>
                  <p className="truncate text-muted-foreground">
                    {expense.item_description}
                  </p>
                </div>
                <span className="text-muted-foreground">
                  {formatShortDate(expense.date)}
                </span>
                <span className="tabular-nums">
                  Paid <strong>{formatCurrency(paid)}</strong>
                </span>
                <span
                  className={
                    owed
                      ? "font-medium text-amber-700 tabular-nums"
                      : "text-muted-foreground tabular-nums"
                  }
                >
                  {owed ? `Owed ${formatCurrency(owed)}` : "Paid in full"}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
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
