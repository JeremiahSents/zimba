"use client"

import {
  type ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { DataTable } from "@workspace/ui/components/data-table"
import Link from "next/link"
import { type ReactNode, useMemo, useState } from "react"
import {
  MobileDataCard,
  MobileDataMeta,
} from "@/components/shared/mobile-data-card"
import { ExpenseStatusBadge } from "@/components/shared/status-badges"
import { useWorkspaceSlug } from "@/components/shared/use-workspace-slug"
import { formatCurrency, formatShortDate } from "@/lib/format"
import type { ExpenseTableRow } from "@/lib/types"

export function ExpenseTable({
  expenses,
  title,
}: {
  expenses: ExpenseTableRow[]
  title?: ReactNode
}) {
  const slug = useWorkspaceSlug()
  const receiptRows = groupExpensesByReceipt(expenses)
  const [globalFilter, setGlobalFilter] = useState("")
  const [sorting, setSorting] = useState<SortingState>([])

  const columns = useMemo<ColumnDef<ExpenseTableRow>[]>(
    () => [
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ getValue }) => formatShortDate(getValue<string>()),
      },
      { accessorKey: "project_name", header: "Project" },
      { accessorKey: "task_name", header: "Task" },
      { accessorKey: "supplier_name", header: "Supplier" },
      {
        accessorKey: "item_description",
        header: "Receipt",
        cell: ({ getValue, row }) => (
          <Link
            href={`/${slug}/expenses/receipts/${row.original.receipt_id ?? row.original.id}`}
          >
            {getValue<string>()}
          </Link>
        ),
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
    [slug]
  )

  const table = useReactTable({
    data: receiptRows,
    columns,
    state: { globalFilter, sorting },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 5 } },
  })

  const totalRows = table.getFilteredRowModel().rows.length

  return (
    <DataTable
      table={table}
      title={title}
      rowNumbers
      search={{
        value: globalFilter,
        onChange: setGlobalFilter,
        placeholder: "Search expenses...",
        label: "Search expenses",
      }}
      emptyMessage="No expenses match your search."
      footerNote={`${totalRows} ${totalRows === 1 ? "expense" : "expenses"}`}
      renderMobileRow={(row) => {
        const expense = row.original
        return (
          <Link
            href={`/${slug}/expenses/receipts/${expense.receipt_id ?? expense.id}`}
            className="block transition-transform active:scale-[0.99]"
          >
            <MobileDataCard
              eyebrow={expense.project_name}
              title={
                <span className="font-medium text-primary">
                  {expense.item_description}
                </span>
              }
              value={formatCurrency(expense.amount)}
              status={<ExpenseStatusBadge status={expense.status} />}
            >
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                <MobileDataMeta label="Task">
                  {expense.task_name}
                </MobileDataMeta>
                <MobileDataMeta label="Date">
                  {formatShortDate(expense.date)}
                </MobileDataMeta>
                <div className="col-span-2">
                  <MobileDataMeta label="Supplier">
                    {expense.supplier_name}
                  </MobileDataMeta>
                </div>
              </dl>
            </MobileDataCard>
          </Link>
        )
      }}
    />
  )
}

function groupExpensesByReceipt(
  expenses: ExpenseTableRow[]
): ExpenseTableRow[] {
  const groups = new Map<string, ExpenseTableRow[]>()
  for (const expense of expenses) {
    const id = expense.receipt_id ?? expense.id
    const group = groups.get(id) ?? []
    groups.set(id, [...group, expense])
  }
  return [...groups.values()].map((items) => {
    const first = items[0]
    if (!first) throw new Error("Receipt group cannot be empty")
    return {
      ...first,
      item_description: `${items.length} item${items.length === 1 ? "" : "s"}`,
      amount: items.reduce((sum, item) => sum + item.amount, 0),
    }
  })
}
