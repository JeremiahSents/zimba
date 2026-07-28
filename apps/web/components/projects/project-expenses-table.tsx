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
import { useRouter } from "next/navigation"
import { type ReactNode, useMemo, useState } from "react"

import {
  MobileDataCard,
  MobileDataMeta,
} from "@/components/shared/mobile-data-card"
import { ExpenseStatusBadge } from "@/components/shared/status-badges"
import { useWorkspaceSlug } from "@/components/shared/use-workspace-slug"
import { formatCurrency, formatShortDate } from "@/lib/format"
import type { ExpenseResponse, ExpenseStatus } from "@/lib/types"

function statusLabel(status: ExpenseStatus) {
  return status === "Full" ? "Paid in full" : status
}

export function ProjectExpensesTable({
  expenses,
  title,
}: {
  expenses: ExpenseResponse[]
  title?: ReactNode
}) {
  const slug = useWorkspaceSlug()
  const router = useRouter()
  const [globalFilter, setGlobalFilter] = useState("")
  const [sorting, setSorting] = useState<SortingState>([])

  const columns = useMemo<ColumnDef<ExpenseResponse>[]>(
    () => [
      {
        accessorKey: "item_description",
        header: "Item",
      },
      {
        accessorKey: "task_name",
        header: "Category",
      },
      {
        accessorKey: "supplier_name",
        header: "Supplier",
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ getValue }) => formatCurrency(getValue<number>()),
        meta: { cellClassName: "tabular-nums whitespace-nowrap" },
      },
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ getValue }) => formatShortDate(getValue<string>()),
        meta: { cellClassName: "tabular-nums whitespace-nowrap" },
      },
      {
        id: "status",
        accessorFn: (expense) => expense.status ?? "Full",
        header: "Status",
        cell: ({ getValue }) => {
          const status = getValue<ExpenseStatus>()
          return (
            <ExpenseStatusBadge status={status} label={statusLabel(status)} />
          )
        },
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
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
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
        label: "Search project expenses",
      }}
      onRowClick={(row) =>
        router.push(
          `/${slug}/expenses/receipts/${row.original.receipt_id ?? row.original.id}`
        )
      }
      emptyMessage="No expenses match your search."
      footerNote={`${totalRows} ${totalRows === 1 ? "expense" : "expenses"}`}
      renderMobileRow={(row) => {
        const expense = row.original
        const status = expense.status ?? "Full"
        return (
          <Link
            href={`/${slug}/expenses/receipts/${expense.receipt_id ?? expense.id}`}
            className="block transition-transform active:scale-[0.99]"
          >
            <MobileDataCard
              eyebrow={expense.task_name}
              title={
                <span className="font-medium text-primary">
                  {expense.item_description}
                </span>
              }
              value={formatCurrency(expense.amount)}
              status={
                <ExpenseStatusBadge
                  status={status}
                  label={statusLabel(status)}
                />
              }
            >
              <dl className="grid grid-cols-2 gap-4">
                <MobileDataMeta label="Supplier">
                  {expense.supplier_name}
                </MobileDataMeta>
                <MobileDataMeta label="Date">
                  {formatShortDate(expense.date)}
                </MobileDataMeta>
              </dl>
            </MobileDataCard>
          </Link>
        )
      }}
    />
  )
}
