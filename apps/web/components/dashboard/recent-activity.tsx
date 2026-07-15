"use client"

import Link from "next/link"

import {
  MobileDataCard,
  MobileDataMeta,
} from "@/components/shared/mobile-data-card"
import { formatCurrency, formatShortDate } from "@/lib/format"
import type { DashboardOverviewData } from "@/lib/types"

const taskPillClasses: Record<string, string> = {
  Concrete: "border-sky-200 bg-sky-50 text-sky-700",
  Labour: "border-amber-200 bg-amber-50 text-amber-700",
  Steel: "border-violet-200 bg-violet-50 text-violet-700",
  Equipment: "border-teal-200 bg-teal-50 text-teal-700",
}

const statusPillClasses = {
  Partial: "border-amber-200 bg-amber-50 text-amber-700",
  Full: "border-green-200 bg-green-50 text-green-700",
  "Not paid": "border-slate-200 bg-slate-50 text-slate-600",
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
        <>
          <div className="space-y-3 md:hidden">
            {expenses.map((expense) => (
              <MobileDataCard
                key={expense.id}
                eyebrow={expense.project_name}
                title={expense.item_description}
                value={formatCurrency(expense.amount)}
                status={
                  <span
                    className={`inline-flex rounded-full border px-2 py-1 font-medium text-[10px] ${statusPillClasses[expense.status]}`}
                  >
                    {expense.status}
                  </span>
                }
              >
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <MobileDataMeta label="Supplier">
                    {expense.supplier_name}
                  </MobileDataMeta>
                  <MobileDataMeta label="Date">
                    {formatShortDate(expense.date)}
                  </MobileDataMeta>
                  <div className="col-span-2">
                    <MobileDataMeta label="Category">
                      {expense.task_name}
                    </MobileDataMeta>
                  </div>
                </dl>
              </MobileDataCard>
            ))}
          </div>
          <div className="hidden overflow-hidden rounded-lg border md:block">
            <table className="w-full table-fixed text-left">
              <colgroup>
                <col className="w-[19%]" />
                <col className="w-[23%]" />
                <col className="w-[16%]" />
                <col className="w-[16%]" />
                <col className="w-[11%]" />
                <col className="w-[15%]" />
              </colgroup>
              <thead className="border-b bg-muted/25 text-[10px] text-muted-foreground sm:text-xs">
                <tr>
                  <th className="px-1 py-2.5 font-medium sm:px-4">
                    Project name
                  </th>
                  <th className="px-1 py-2.5 font-medium sm:px-4">
                    Expense name
                  </th>
                  <th className="px-1 py-2.5 font-medium sm:px-4">Supplier</th>
                  <th className="px-1 py-2.5 font-medium sm:px-4">Category</th>
                  <th className="px-1 py-2.5 font-medium sm:px-4">Date</th>
                  <th className="px-1 py-2.5 font-medium sm:px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-muted/35">
                    <td className="px-1 py-3 align-top sm:px-4 sm:align-middle">
                      <p className="break-words font-medium text-[10px] sm:text-xs">
                        {expense.project_name}
                      </p>
                    </td>
                    <td className="px-1 py-3 align-top sm:px-4 sm:align-middle">
                      <p className="break-words text-[10px] sm:text-xs">
                        {expense.item_description}
                      </p>
                    </td>
                    <td className="break-words px-1 py-3 align-top text-[10px] text-muted-foreground sm:px-4 sm:align-middle sm:text-xs">
                      {expense.supplier_name}
                    </td>
                    <td className="px-0.5 py-3 align-top sm:px-4 sm:align-middle">
                      <span
                        className={`inline-flex max-w-full break-words rounded-md border px-1 py-0.5 font-medium text-[9px] sm:px-1.5 sm:text-[10px] ${taskPillClasses[expense.task_name] ?? "border-border bg-muted/50 text-muted-foreground"}`}
                      >
                        {expense.task_name}
                      </span>
                    </td>
                    <td className="px-1 py-3 align-top text-[10px] text-muted-foreground sm:px-4 sm:align-middle sm:text-xs">
                      {formatShortDate(expense.date)}
                    </td>
                    <td className="px-1 py-3 align-top sm:px-4 sm:align-middle">
                      <span
                        className={`inline-flex max-w-full break-words rounded-md border px-1 py-0.5 font-medium text-[9px] sm:px-1.5 sm:text-[10px] ${statusPillClasses[expense.status]}`}
                      >
                        {expense.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <p className="py-4 text-center text-muted-foreground text-xs">
          No expenses yet.
        </p>
      )}
      <div className="mt-4 flex justify-center border-t pt-3">
        <Link
          href="/admin/expenses"
          className="inline-flex min-h-11 items-center rounded-md border border-border px-4 font-semibold text-foreground text-xs transition-colors hover:bg-muted md:min-h-0 md:py-1.5"
        >
          View more
        </Link>
      </div>
    </section>
  )
}
