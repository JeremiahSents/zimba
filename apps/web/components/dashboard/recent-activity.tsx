"use client"

import {
  Analytics02Icon,
  FolderKanbanIcon,
  Invoice02Icon,
  MoneyBag02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { formatCurrency, formatShortDate } from "@/lib/format"
import type { DashboardOverviewData } from "@/lib/types"

const activityIcons = [
  Invoice02Icon,
  MoneyBag02Icon,
  FolderKanbanIcon,
  Analytics02Icon,
]

export function RecentActivity({
  expenses,
}: {
  expenses: DashboardOverviewData["expenses"]
}) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-4">
        <h2 className="font-heading font-semibold text-base text-foreground">
          Recent activity
        </h2>
        <Link
          href="/dashboard/analytics"
          className="font-semibold text-primary text-xs transition-colors hover:text-primary/75"
        >
          View analytics
        </Link>
      </div>
      {expenses.length ? (
        <div className="divide-y">
          {expenses.map((expense, index) => (
            <div
              key={expense.id}
              className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
            >
              <span className="grid size-8 shrink-0 place-items-center text-primary">
                <HugeiconsIcon
                  icon={
                    activityIcons[index % activityIcons.length] ?? Invoice02Icon
                  }
                  strokeWidth={1.8}
                  className="size-4"
                />
              </span>
              <div className="min-w-0">
                <p className="truncate font-medium text-sm">
                  {expense.item_description}
                </p>
                <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                  {expense.project_name} · {expense.supplier_name}
                </p>
              </div>
              <div className="ml-auto shrink-0 text-right">
                <p className="font-semibold text-sm">
                  {formatCurrency(expense.amount)}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {formatShortDate(expense.date)}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="py-4 text-center text-muted-foreground text-xs">
          No activity yet.
        </p>
      )}
      <div className="mt-3 flex justify-center border-t pt-3">
        <Link
          href="/dashboard/analytics"
          className="rounded-md border border-border px-3 py-1.5 font-semibold text-foreground text-xs transition-colors hover:bg-muted"
        >
          View more
        </Link>
      </div>
    </section>
  )
}
