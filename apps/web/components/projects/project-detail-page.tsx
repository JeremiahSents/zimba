"use client"

import { Accordion } from "@base-ui/react/accordion"
import { Menu } from "@base-ui/react/menu"
import {
  ArrowDown01Icon,
  MoreHorizontalCircle01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Card, CardContent } from "@workspace/ui/components/card"
import {
  type ChartConfig,
  ChartContainer,
} from "@workspace/ui/components/chart"
import { Progress } from "@workspace/ui/components/progress"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Cell, Pie, PieChart } from "recharts"
import { ProjectExpensesTable } from "@/components/projects/project-expenses-table"
import { DashboardShell } from "@/components/shared/dashboard-shell"
import { ErrorNotice } from "@/components/shared/error-notice"
import { useWorkspaceSlug } from "@/components/shared/use-workspace-slug"
import { archiveProjectAction } from "@/core/projects/actions"
import type { PublicError } from "@/core/shared/errors"
import { formatCurrency, formatPercent, formatShortDate } from "@/lib/format"
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
  initialProject,
}: {
  initialProject: ProjectDetailResponse
}) {
  return <ProjectDetailPage project={initialProject} />
}

export function ProjectDetailPage({
  project,
}: {
  project: ProjectDetailResponse
}) {
  const router = useRouter()
  const slug = useWorkspaceSlug()
  const [expenses, setExpenses] = useState(project.expenses)
  const [mutationError] = useState<PublicError | string>("")

  useEffect(() => {
    setExpenses(project.expenses)
  }, [project])

  const spent = project.spent
  const taskData = expenses.reduce<Array<{ name: string; value: number }>>(
    (items, expense) => {
      const name = expense.task_name || "General"
      const existing = items.find((item) => item.name === name)
      if (existing) existing.value += expense.amount
      else items.push({ name, value: expense.amount })
      return items
    },
    []
  )
  const utilisation = project.pct
  const budgetHealth = getBudgetHealth(utilisation)

  return (
    <DashboardShell
      title={
        <Link
          href={`/${slug}/projects`}
          aria-label="Back to projects"
          className="inline-flex items-center gap-1.5 text-primary text-sm hover:underline"
        >
          ← <span>Back</span>
        </Link>
      }
      subtitle="Project financial position and delivery tracking."
    >
      <div className="mb-3">
        <div className="flex items-start justify-between gap-4">
          <h2
            className="min-w-0 break-words font-heading font-semibold text-2xl tracking-tight"
            title={project.name}
          >
            {project.name}
          </h2>
          <div className="hidden items-center gap-2 md:flex">
            <Link
              href={`/${slug}/projects/${project.id}/edit`}
              className="inline-flex h-9 items-center rounded-md border bg-background px-3 font-medium text-xs shadow-xs transition-colors hover:bg-accent"
            >
              Edit project
            </Link>
            <Link
              href={`/${slug}/projects/${project.id}/expenses/new`}
              className="inline-flex h-9 items-center rounded-md bg-primary px-3 font-medium text-primary-foreground text-xs shadow-xs transition-colors hover:bg-primary/90"
            >
              New expense
            </Link>
            <Link
              href={`/${slug}/projects/${project.id}/files`}
              className="inline-flex h-9 items-center rounded-md border bg-background px-3 font-medium text-xs shadow-xs transition-colors hover:bg-accent"
            >
              View files
            </Link>
            <button
              type="button"
              onClick={async () => {
                if (
                  window.confirm(
                    "Archive this project? It will be removed from active dashboards but its records will be preserved."
                  )
                ) {
                  await archiveProjectAction(project.id)
                  router.push(`/${slug}/projects`)
                }
              }}
              className="inline-flex h-9 items-center rounded-md border border-destructive/30 px-3 font-medium text-destructive text-xs transition-colors hover:bg-destructive/10"
            >
              Archive
            </button>
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-1.5 md:hidden">
            <Link
              href={`/${slug}/projects/${project.id}/expenses/new`}
              className="inline-flex h-9 items-center rounded-md bg-primary px-3 font-medium text-primary-foreground text-xs shadow-xs transition-colors hover:bg-primary/90"
            >
              New expense
            </Link>
            <Menu.Root>
              <Menu.Trigger
                aria-label={`Open actions for ${project.name}`}
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-md border bg-background text-foreground shadow-xs outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
              >
                <HugeiconsIcon
                  icon={MoreHorizontalCircle01Icon}
                  strokeWidth={2}
                  className="size-5"
                />
              </Menu.Trigger>
              <Menu.Portal>
                <Menu.Positioner
                  align="end"
                  side="bottom"
                  sideOffset={6}
                  className="isolate z-50 outline-none"
                >
                  <Menu.Popup className="min-w-44 origin-(--transform-origin) rounded-lg border bg-popover p-1 text-popover-foreground shadow-md outline-none">
                    <Menu.LinkItem
                      closeOnClick
                      render={
                        <Link href={`/${slug}/projects/${project.id}/edit`} />
                      }
                      className="flex cursor-default items-center rounded-md px-2.5 py-2 font-medium text-xs outline-none data-highlighted:bg-accent"
                    >
                      Edit project
                    </Menu.LinkItem>
                    <Menu.LinkItem
                      closeOnClick
                      render={
                        <Link href={`/${slug}/projects/${project.id}/files`} />
                      }
                      className="flex cursor-default items-center rounded-md px-2.5 py-2 font-medium text-xs outline-none data-highlighted:bg-accent"
                    >
                      View files and images
                    </Menu.LinkItem>
                    <Menu.Item
                      onClick={async () => {
                        if (
                          window.confirm(
                            "Archive this project? It will be removed from active dashboards but its records will be preserved."
                          )
                        ) {
                          await archiveProjectAction(project.id)
                          router.push(`/${slug}/projects`)
                        }
                      }}
                      className="flex cursor-default items-center rounded-md px-2.5 py-2 font-medium text-destructive text-xs outline-none data-highlighted:bg-destructive/10"
                    >
                      Archive project
                    </Menu.Item>
                  </Menu.Popup>
                </Menu.Positioner>
              </Menu.Portal>
            </Menu.Root>
          </div>
        </div>
        <p className="mt-1 text-muted-foreground text-xs">
          {project.location}
          {project.plot_size ? ` · ${project.plot_size}` : ""}
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
        <div className="col-span-2 lg:col-span-1">
          <Metric
            label="Total budget"
            value={formatCurrency(project.budget)}
            tone="positive"
          />
        </div>
        <Metric
          label="Total spent"
          value={formatCurrency(spent)}
          detail={`${formatPercent(utilisation)} used`}
          tone="negative"
          pillClassName={budgetHealth.pill}
        />
        <Metric
          label="Remaining budget"
          value={formatCurrency(project.remaining)}
          detail={`${formatPercent(Math.max(100 - utilisation, 0))} left`}
          tone="positive"
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

      <div>
        {mutationError && (
          <ErrorNotice
            className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/25 bg-destructive/5 px-4 py-3"
            error={mutationError}
          />
        )}
        <section className="flex min-h-0 flex-col pt-1">
          <div className="mb-4">
            <h2 className="font-heading font-semibold text-base tracking-tight">
              Expenses
            </h2>
            <p className="mt-1 text-muted-foreground text-xs">
              Track every project expense and its payment status in one place.
            </p>
          </div>
          <ProjectExpensesTable expenses={expenses} />
        </section>
      </div>
    </DashboardShell>
  )
}

function Metric({
  label,
  value,
  detail,
  tone,
  pillClassName,
}: {
  label: string
  value: string
  detail?: string
  tone: "positive" | "negative"
  pillClassName?: string
}) {
  const isPositive = tone === "positive"
  return (
    <Card
      className={`relative isolate flex min-h-[104px] flex-col justify-between gap-2 overflow-hidden p-4 sm:p-5 ${isPositive ? "bg-emerald-50/40" : "bg-rose-50/40"}`}
    >
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-16 w-full opacity-70"
        preserveAspectRatio="none"
        viewBox="0 0 320 64"
      >
        <path
          d={
            isPositive
              ? "M0 56 C35 52 44 42 74 47 S120 58 151 39 S202 34 232 25 S277 31 320 8 V64 H0 Z"
              : "M0 22 C35 16 50 35 80 28 S124 18 155 40 S202 31 234 45 S278 35 320 54 V64 H0 Z"
          }
          fill={isPositive ? "#bbf7d0" : "#fecdd3"}
          fillOpacity=".45"
        />
        <path
          d={
            isPositive
              ? "M0 56 C35 52 44 42 74 47 S120 58 151 39 S202 34 232 25 S277 31 320 8"
              : "M0 22 C35 16 50 35 80 28 S124 18 155 40 S202 31 234 45 S278 35 320 54"
          }
          fill="none"
          stroke={isPositive ? "#34d399" : "#fb7185"}
          strokeLinecap="round"
          strokeWidth="2"
        />
      </svg>
      <div className="relative z-10 flex items-start justify-between gap-2">
        <p className="min-w-0 whitespace-nowrap font-medium text-muted-foreground text-xs">
          {label}
        </p>
        {detail && (
          <p
            className={`shrink-0 whitespace-nowrap rounded-lg px-1.5 py-0.5 text-right font-medium text-[10px] ${pillClassName}`}
          >
            {detail}
          </p>
        )}
      </div>
      <p className="relative mt-1 font-heading font-semibold text-lg tabular-nums tracking-tight sm:text-xl">
        {value}
      </p>
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
      <Accordion.Root className="grid gap-2">
        {tasks.map((task, index) => {
          const taskSpent = task.spent
          const percentage = task.budget
            ? Math.min((taskSpent / task.budget) * 100, 100)
            : 0
          const budgetHealth = getBudgetHealth(percentage)
          return (
            <Accordion.Item
              key={task.id}
              value={String(task.id)}
              className="group/task overflow-hidden rounded-lg border border-border/70 bg-card"
            >
              <Accordion.Trigger className="relative block w-full cursor-pointer touch-manipulation text-left outline-none transition-[background-color,transform] duration-150 hover:bg-muted/30 focus-visible:ring-2 focus-visible:ring-ring/45 focus-visible:ring-inset active:scale-[0.995]">
                <div className="pointer-events-none grid w-full items-center gap-3 px-4 py-3 pr-11 sm:grid-cols-[minmax(9rem,0.85fr)_minmax(10rem,1.6fr)_minmax(12rem,1fr)]">
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
                <HugeiconsIcon
                  icon={ArrowDown01Icon}
                  strokeWidth={1.8}
                  className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-muted-foreground transition-transform duration-150 ease-[var(--ease-out-ui)] group-data-[open]/task:rotate-180 motion-reduce:transition-none"
                />
              </Accordion.Trigger>
              <Accordion.Panel>
                <TaskExpenseDetails
                  taskName={task.name}
                  expenses={expenses.filter(
                    (expense) => expense.task_name === task.name
                  )}
                />
              </Accordion.Panel>
            </Accordion.Item>
          )
        })}
      </Accordion.Root>
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
              expense.paid_amount ??
              (expense.status === "Full" ? expense.amount : 0)
            const owed =
              expense.outstanding_amount ?? Math.max(expense.amount - paid, 0)
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
