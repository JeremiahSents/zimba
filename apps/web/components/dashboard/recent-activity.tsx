"use client"

import {
  type ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { DataTable } from "@workspace/ui/components/data-table"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"

import {
  MobileDataCard,
  MobileDataMeta,
} from "@/components/shared/mobile-data-card"
import { ExpenseStatusBadge } from "@/components/shared/status-badges"
import { useWorkspaceSlug } from "@/components/shared/use-workspace-slug"
import {
  formatCurrency,
  formatShortDate,
  formatTitleCase,
} from "@/lib/format"
import type { DashboardOverviewData, ExpenseTableRow } from "@/lib/types"

export function RecentActivity({
  expenses,
}: {
  expenses: DashboardOverviewData["expenses"]
}) {
  const slug = useWorkspaceSlug()
  const router = useRouter()
  const [globalFilter, setGlobalFilter] = useState("")
  const [sorting, setSorting] = useState<SortingState>([])

  const columns = useMemo<ColumnDef<ExpenseTableRow>[]>(
    () => [
      {
        accessorKey: "project_name",
        header: "Project",
        cell: ({ row }) => (
          <span className="font-medium">
            {formatTitleCase(row.original.project_name)}
          </span>
        ),
      },
      {
        accessorKey: "item_description",
        header: "Expense",
        cell: ({ getValue }) => formatTitleCase(getValue<string>()),
      },
      {
        accessorKey: "supplier_name",
        header: "Supplier",
        cell: ({ getValue }) => formatTitleCase(getValue<string>()),
        meta: { cellClassName: "whitespace-nowrap" },
      },
      {
        accessorKey: "task_name",
        header: "Category",
      },
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ getValue }) => formatShortDate(getValue<string>()),
        meta: { cellClassName: "tabular-nums whitespace-nowrap" },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <ExpenseStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ getValue }) => formatCurrency(getValue<number>()),
        meta: { cellClassName: "tabular-nums whitespace-nowrap" },
      },
    ],
    []
  )

  const table = useReactTable({
    data: expenses,
    columns,
    state: { globalFilter, sorting },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <section>
      <DataTable
        table={table}
        title="Recent expenses"
        rowNumbers
        search={{
          value: globalFilter,
          onChange: setGlobalFilter,
          placeholder: "Search expenses...",
          label: "Search recent expenses",
        }}
        onRowClick={(row) =>
          router.push(
            `/${slug}/expenses/receipts/${row.original.receipt_id ?? row.original.id}`
          )
        }
        emptyMessage="No expenses yet."
        pagination="never"
        renderMobileRow={(row) => {
          const expense = row.original
          return (
            <Link
              href={`/${slug}/expenses/receipts/${expense.receipt_id ?? expense.id}`}
              className="block transition-transform active:scale-[0.99]"
            >
              <MobileDataCard
                eyebrow={formatTitleCase(expense.project_name)}
                title={
                  <span className="font-medium text-primary">
                    {formatTitleCase(expense.item_description)}
                  </span>
                }
                value={formatCurrency(expense.amount)}
                status={<ExpenseStatusBadge status={expense.status} />}
              >
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <MobileDataMeta label="Supplier">
                    {formatTitleCase(expense.supplier_name)}
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
            </Link>
          )
        }}
      />
      <div className="mt-4 flex justify-center">
        <Link
          href={`/${slug}/projects`}
          className="inline-flex min-h-11 items-center rounded-md border border-border px-4 font-semibold text-foreground text-xs transition-colors hover:bg-muted md:min-h-0 md:py-1.5"
        >
          View more
        </Link>
      </div>
    </section>
  )
}
