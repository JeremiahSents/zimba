"use client"

import { Badge } from "@workspace/ui/components/badge"
import { Progress } from "@workspace/ui/components/progress"
import Link from "next/link"
import { ProjectExpensesTable } from "@/components/projects/project-expenses-table"
import { DashboardShell } from "@/components/shared/dashboard-shell"
import { useWorkspaceSlug } from "@/components/shared/use-workspace-slug"
import { formatCurrency, formatPercent, formatTitleCase } from "@/lib/format"
import type { ExpenseResponse, ProjectDetailResponse } from "@/lib/types"

export function ProjectTaskPage({
  project,
  taskId,
}: {
  project: ProjectDetailResponse
  taskId: string
}) {
  const slug = useWorkspaceSlug()
  const task = project.tasks.find((item) => item.id === taskId)

  if (!task) return null

  const expenses = project.expenses.filter(
    (expense) => expense.task_name === task.name
  )
  const totals = sumPayments(expenses)
  const left = task.budget - task.spent
  const over = left < 0
  const usedPct = task.budget ? (task.spent / task.budget) * 100 : 0

  return (
    <DashboardShell
      title={
        <Link
          href={`/${slug}/projects/${project.id}`}
          aria-label={`Back to ${project.name}`}
          className="inline-flex items-center gap-1.5 text-primary text-sm hover:underline"
        >
          ← <span>Back</span>
        </Link>
      }
      subtitle="Budget and receipts recorded against this category."
    >
      <div className="mb-5">
        <h2 className="break-words font-heading font-semibold text-2xl tracking-tight">
          {formatTitleCase(task.name)}
        </h2>
        <p className="mt-1 text-muted-foreground text-sm">
          {formatTitleCase(project.name)}
        </p>
      </div>

      <div className="mb-4 overflow-hidden rounded-2xl border bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <p className="font-medium text-[11px] text-muted-foreground uppercase tracking-[0.06em]">
            Budget
          </p>
          <Badge variant={over ? "destructive" : "secondary"}>
            {formatPercent(Math.round(usedPct))} used
          </Badge>
        </div>

        <p className="mt-3 font-heading font-semibold text-2xl tabular-nums tracking-tight">
          {formatCurrency(task.spent)}
          <span className="ml-1.5 font-normal text-base text-muted-foreground">
            of {formatCurrency(task.budget)}
          </span>
        </p>
        <p
          className={`mt-1 text-sm ${over ? "text-destructive" : "text-success"}`}
        >
          {over
            ? `${formatCurrency(Math.abs(left))} over budget`
            : `${formatCurrency(left)} left`}
        </p>

        <Progress
          value={Math.min(usedPct, 100)}
          className={`mt-4 h-1.5 ${
            over ? "[&_[data-slot=progress-indicator]]:bg-destructive" : ""
          }`}
        />

        <dl className="mt-5 grid grid-cols-2 gap-4 border-t pt-4 sm:grid-cols-3">
          <div>
            <dt className="text-muted-foreground text-xs">Receipts</dt>
            <dd className="mt-1 text-sm tabular-nums">{expenses.length}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs">Paid</dt>
            <dd className="mt-1 text-sm tabular-nums">
              {formatCurrency(totals.paid)}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs">Outstanding</dt>
            <dd className="mt-1 text-sm tabular-nums">
              {formatCurrency(totals.outstanding)}
            </dd>
          </div>
        </dl>
      </div>

      <ProjectExpensesTable expenses={expenses} title="Receipts" />
    </DashboardShell>
  )
}

function paidAmount(expense: ExpenseResponse) {
  return expense.paid_amount ?? (expense.status === "Full" ? expense.amount : 0)
}

function sumPayments(expenses: ExpenseResponse[]) {
  return expenses.reduce(
    (totals, expense) => {
      const paid = paidAmount(expense)
      return {
        paid: totals.paid + paid,
        outstanding:
          totals.outstanding +
          (expense.outstanding_amount ?? Math.max(expense.amount - paid, 0)),
      }
    },
    { paid: 0, outstanding: 0 }
  )
}
