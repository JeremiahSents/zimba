"use client"

import {
  Analytics02Icon,
  FolderKanbanIcon,
  Invoice02Icon,
  MoneyBag02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"

import { formatCurrency } from "@/lib/format"
import type { DashboardOverviewData } from "@/lib/types"

const activityIcons = [
  Invoice02Icon,
  MoneyBag02Icon,
  FolderKanbanIcon,
  Analytics02Icon,
]

const taskPillClasses: Record<string, string> = {
  Concrete: "border-sky-500 text-sky-600",
  Labour: "border-amber-500 text-amber-600",
  Steel: "border-violet-500 text-violet-600",
  Equipment: "border-teal-500 text-teal-600",
}

const statusPillClasses = {
  confirmed: "border-green-500 text-green-600",
  pending: "border-amber-500 text-amber-600",
  rejected: "border-red-500 text-red-600",
}

export function RecentActivity({
  expenses,
}: {
  expenses: DashboardOverviewData["expenses"]
}) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-heading font-semibold text-base text-foreground tracking-tight">
          Recent expenses
        </h2>
        <Link
          href="/admin/expenses"
          className="font-semibold text-primary text-xs transition-colors hover:text-primary/75"
        >
          View expenses
        </Link>
      </div>
      {expenses.length ? (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[34rem] text-left">
            <thead className="border-b bg-muted/25 text-muted-foreground text-xs">
              <tr>
                <th className="px-4 py-2.5 font-medium">Expense</th>
                <th className="border-l px-4 py-2.5 font-medium">
                  Category & supplier
                </th>
                <th className="border-l px-4 py-2.5 text-right font-medium">
                  Amount
                </th>
                <th className="border-l px-4 py-2.5 text-right font-medium">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {expenses.map((expense, index) => (
                <tr key={expense.id} className="hover:bg-muted/35">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <HugeiconsIcon
                        icon={
                          activityIcons[index % activityIcons.length] ??
                          Invoice02Icon
                        }
                        strokeWidth={1.8}
                        className="size-4 shrink-0 text-primary"
                      />
                      <p className="truncate font-medium text-xs">
                        {expense.item_description}
                      </p>
                    </div>
                  </td>
                  <td className="border-l px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex rounded-lg border px-1.5 py-0.5 font-medium text-[10px] ${taskPillClasses[expense.task_name] ?? "border-muted-foreground/40 text-muted-foreground"}`}
                      >
                        {expense.task_name}
                      </span>
                      <span className="truncate text-muted-foreground text-xs">
                        {expense.supplier_name}
                      </span>
                    </div>
                  </td>
                  <td className="border-l px-4 py-3 text-right font-semibold text-xs">
                    {formatCurrency(expense.amount)}
                  </td>
                  <td className="border-l px-4 py-3 text-right">
                    <span
                      className={`inline-flex rounded-lg border px-1.5 py-0.5 font-medium text-[10px] capitalize ${statusPillClasses[expense.status ?? "pending"]}`}
                    >
                      {expense.status ?? "pending"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="py-4 text-center text-muted-foreground text-xs">
          No expenses yet.
        </p>
      )}
      <div className="mt-4 flex justify-center border-t pt-3">
        <Link
          href="/admin/expenses"
          className="rounded-md border border-border px-3 py-1.5 font-semibold text-foreground text-xs transition-colors hover:bg-muted"
        >
          View more
        </Link>
      </div>
    </section>
  )
}
