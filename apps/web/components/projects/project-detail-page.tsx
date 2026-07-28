"use client"

import { Menu } from "@base-ui/react/menu"
import { MoreHorizontalCircle01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  type ChartConfig,
  ChartContainer,
} from "@workspace/ui/components/chart"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Bar, BarChart, Cell, XAxis, YAxis } from "recharts"
import { ProjectExpensesTable } from "@/components/projects/project-expenses-table"
import { DashboardShell } from "@/components/shared/dashboard-shell"
import { ErrorNotice } from "@/components/shared/error-notice"
import { useWorkspaceSlug } from "@/components/shared/use-workspace-slug"
import { archiveProjectAction } from "@/core/projects/actions"
import type { PublicError } from "@/core/shared/errors"
import { formatCurrency, formatPercent, formatTitleCase } from "@/lib/format"
import type { ExpenseResponse, ProjectDetailResponse } from "@/lib/types"

/**
 * Categorical slots for task identity, in fixed order. Validated against the
 * white card surface: all four hard checks pass, worst adjacent pair ΔE 9.1
 * (protan) / 19.6 (normal). Every swatch sits beside its task name and amount,
 * which satisfies the contrast relief rule.
 */
const taskColors = [
  "#2a78d6",
  "#eb6834",
  "#1baf7a",
  "#eda100",
  "#e87ba4",
  "#4a3aa7",
] as const

const chartConfig: ChartConfig = {
  spent: { label: "Spent" },
  unspent: { label: "Unspent" },
}

/** Soft card chrome: no hard border, generous radius, barely-there lift. */
const panel = "overflow-hidden rounded-2xl border bg-card"

const eyebrow =
  "font-medium text-[11px] text-muted-foreground uppercase tracking-[0.06em]"

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

  const utilisation = project.pct
  const totals = sumPayments(expenses)
  // Each bar is normalised to its own budget, so a small budget that is
  // mostly used reads as a long bar instead of vanishing next to a large one.
  // Ranked most-used first; the task list shares the order so the two halves
  // of the card read as one ranking.
  const rankedTasks = [...project.tasks].sort(
    (a, b) => utilisationOf(b) - utilisationOf(a)
  )
  const colorFor = buildTaskColors(rankedTasks)
  const spendByTask = rankedTasks.map((task) => {
    const pct = utilisationOf(task)
    return { name: task.name, spent: pct, unspent: 100 - pct }
  })

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
      <div className="mb-5">
        <div className="flex items-start justify-between gap-4">
          <h2
            className="min-w-0 break-words font-heading font-semibold text-2xl tracking-tight"
            title={project.name}
          >
            {formatTitleCase(project.name)}
          </h2>
          <div className="flex shrink-0 items-center gap-1.5">
            <Link
              href={`/${slug}/projects/${project.id}/expenses/new`}
              className="inline-flex h-9 items-center rounded-lg bg-primary px-3.5 font-medium text-primary-foreground text-xs transition-colors hover:bg-primary/90"
            >
              New expense
            </Link>
            <Menu.Root>
              <Menu.Trigger
                aria-label={`Open actions for ${project.name}`}
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
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
                  <Menu.Popup className="min-w-48 origin-(--transform-origin) rounded-xl bg-popover p-1 text-popover-foreground shadow-lg outline-none">
                    <Menu.LinkItem
                      closeOnClick
                      render={
                        <Link href={`/${slug}/projects/${project.id}/edit`} />
                      }
                      className="flex cursor-default items-center rounded-lg px-2.5 py-2 text-sm outline-none data-highlighted:bg-accent"
                    >
                      Edit project
                    </Menu.LinkItem>
                    <Menu.LinkItem
                      closeOnClick
                      render={
                        <Link href={`/${slug}/projects/${project.id}/files`} />
                      }
                      className="flex cursor-default items-center rounded-lg px-2.5 py-2 text-sm outline-none data-highlighted:bg-accent"
                    >
                      View files and images
                    </Menu.LinkItem>
                    <Menu.Item
                      onClick={() => confirmArchive(project.id, router, slug)}
                      className="mt-0.5 flex cursor-default items-center rounded-lg px-2.5 py-2 text-destructive text-sm outline-none data-highlighted:bg-destructive/10"
                    >
                      Archive project
                    </Menu.Item>
                  </Menu.Popup>
                </Menu.Positioner>
              </Menu.Portal>
            </Menu.Root>
          </div>
        </div>
        <p className="mt-1 text-muted-foreground text-sm">
          {project.location}
          {project.land_size ? ` · ${project.land_size}` : ""}
        </p>
      </div>

      <div className={`mb-4 ${panel}`}>
        <div className="grid divide-y lg:grid-cols-2 lg:divide-x lg:divide-y-0">
          <div className="flex flex-col p-5 sm:p-6">
            <div className="flex items-baseline justify-between gap-4">
              <p className={eyebrow}>Budget</p>
              <p className={eyebrow}>{formatPercent(utilisation)} used</p>
            </div>
            <div className="mt-4">
              <p className="font-heading font-semibold text-2xl tabular-nums tracking-tight">
                {formatCurrency(project.remaining)}
                <span className="ml-1.5 font-normal font-sans text-base text-muted-foreground">
                  remaining
                </span>
              </p>
            </div>
            <ChartContainer
              config={chartConfig}
              className="mt-6 w-full"
              style={{ height: Math.max(spendByTask.length, 1) * 48 }}
            >
              <BarChart
                accessibilityLayer
                data={spendByTask}
                layout="vertical"
                margin={{ top: 0, right: 12, bottom: 0, left: 0 }}
                barSize={26}
              >
                <YAxis
                  dataKey="name"
                  type="category"
                  width={82}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--foreground)", fontSize: 13 }}
                />
                <XAxis type="number" hide domain={[0, 100]} />
                <Bar
                  dataKey="unspent"
                  stackId="budget"
                  fill="var(--muted)"
                  radius={6}
                  stroke="var(--card)"
                  strokeWidth={2}
                />
                <Bar
                  dataKey="spent"
                  stackId="budget"
                  radius={6}
                  stroke="var(--card)"
                  strokeWidth={2}
                >
                  {spendByTask.map((row) => (
                    <Cell key={row.name} fill={colorFor(row.name)} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
            <p className="mt-auto pt-5 text-sm">
              <span className="tabular-nums">
                {formatCurrency(project.spent)}
              </span>
              <span className="text-muted-foreground"> spent of </span>
              <span className="tabular-nums">
                {formatCurrency(project.budget)}
              </span>
            </p>
          </div>

          <TaskBreakdown
            tasks={rankedTasks}
            colorFor={colorFor}
            taskHref={(taskId) =>
              `/${slug}/projects/${project.id}/tasks/${taskId}`
            }
          />
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t px-5 py-4 text-sm sm:px-6">
          <span>
            <span className="text-muted-foreground">Paid </span>
            <span className="tabular-nums">{formatCurrency(totals.paid)}</span>
            <span className="text-muted-foreground tabular-nums">
              {" "}
              (
              {formatPercent(
                share(totals.paid, totals.paid + totals.outstanding)
              )}
              )
            </span>
          </span>
          {totals.outstanding > 0 ? (
            <span>
              <span className="text-muted-foreground">Outstanding </span>
              <span className="text-warning tabular-nums">
                {formatCurrency(totals.outstanding)}
              </span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-success">
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-success"
              />
              All receipts settled
            </span>
          )}
          <span className="ml-auto text-muted-foreground">
            {expenses.length} {expenses.length === 1 ? "receipt" : "receipts"}
          </span>
        </div>
      </div>

      <div>
        {mutationError && (
          <ErrorNotice
            className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-destructive/5 px-4 py-3"
            error={mutationError}
          />
        )}
        <ProjectExpensesTable expenses={expenses} title="Expenses" />
      </div>
    </DashboardShell>
  )
}

function TaskBreakdown({
  tasks,
  colorFor,
  taskHref,
}: {
  tasks: ProjectDetailResponse["tasks"]
  colorFor: (name: string) => string | undefined
  taskHref: (taskId: string) => string
}) {
  return (
    <div className="p-5 sm:p-6">
      <div className="flex items-baseline justify-between gap-4">
        <p className={eyebrow}>Task · {tasks.length}</p>
        <p className={eyebrow}>Spent</p>
      </div>

      <ul className="mt-1 flex flex-col">
        {tasks.map((task) => {
          const left = task.budget - task.spent
          const over = left < 0
          return (
            <li key={task.id}>
              <Link
                href={taskHref(task.id)}
                className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-3.5 outline-none transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 sm:gap-4"
              >
                <span
                  aria-hidden="true"
                  className="grid size-9 shrink-0 place-items-center rounded-xl"
                  style={{ backgroundColor: `${colorFor(task.name)}1f` }}
                >
                  <span
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: colorFor(task.name) }}
                  />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="break-words text-sm">{task.name}</p>
                  <p
                    className={`mt-0.5 text-xs ${over ? "text-destructive" : "text-success"}`}
                  >
                    {over
                      ? `${formatCurrency(Math.abs(left))} over`
                      : `${formatCurrency(left)} left`}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-sm tabular-nums">
                    {formatCurrency(task.spent)}
                  </p>
                  <p className="mt-0.5 text-muted-foreground text-xs tabular-nums">
                    from {formatCurrency(task.budget)}
                  </p>
                </div>
              </Link>
            </li>
          )
        })}
        {tasks.length === 0 ? (
          <li className="py-8 text-center text-muted-foreground text-sm">
            No task budgets set up for this project yet.
          </li>
        ) : null}
      </ul>
    </div>
  )
}

function utilisationOf(task: ProjectDetailResponse["tasks"][number]) {
  if (task.budget > 0) {
    return Math.min((task.spent / task.budget) * 100, 100)
  }
  return task.spent > 0 ? 100 : 0
}

function buildTaskColors(tasks: ProjectDetailResponse["tasks"]) {
  const byName = new Map(
    tasks.map((task, index) => [
      task.name,
      taskColors[index % taskColors.length] as string,
    ])
  )
  return (name: string) => byName.get(name)
}

function share(part: number, whole: number) {
  return whole > 0 ? (part / whole) * 100 : 0
}

async function confirmArchive(
  projectId: string,
  router: ReturnType<typeof useRouter>,
  slug: string
) {
  if (
    !window.confirm(
      "Archive this project? It will be removed from active dashboards but its records will be preserved."
    )
  ) {
    return
  }
  await archiveProjectAction(projectId)
  router.push(`/${slug}/projects`)
}

function paidAmount(expense: ExpenseResponse) {
  return expense.paid_amount ?? (expense.status === "Full" ? expense.amount : 0)
}

function outstandingAmount(expense: ExpenseResponse) {
  return (
    expense.outstanding_amount ??
    Math.max(expense.amount - paidAmount(expense), 0)
  )
}

function sumPayments(expenses: ExpenseResponse[]) {
  return expenses.reduce(
    (totals, expense) => ({
      paid: totals.paid + paidAmount(expense),
      outstanding: totals.outstanding + outstandingAmount(expense),
    }),
    { paid: 0, outstanding: 0 }
  )
}
