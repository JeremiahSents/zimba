"use client"

import type { AdminRecentExpenseDto } from "@workspace/api"
import {
  type ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { DataTable } from "@workspace/ui/components/data-table"
import { type ReactNode, useEffect, useMemo, useState } from "react"
import { StatusBadge } from "@/components/status-badge"
import { formatCompactCurrency } from "@/lib/format-currency"

function formatShortDate(dateInput: Date | string) {
  return new Date(dateInput).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function toTitleCase(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, " ")
    .replace(/\b\p{L}/gu, (match) => match.toUpperCase())
}

export function RecentExpensesTable({
  expenses,
  currency,
  title,
}: {
  expenses: AdminRecentExpenseDto[]
  currency: string
  title?: ReactNode
}) {
  const [globalFilter, setGlobalFilter] = useState("")
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  })

  useEffect(() => {
    setPagination((current) =>
      current.pageIndex === 0 ? current : { ...current, pageIndex: 0 }
    )
  }, [globalFilter])

  const columns = useMemo<ColumnDef<AdminRecentExpenseDto>[]>(
    () => [
      {
        accessorKey: "date",
        header: "Date",
        accessorFn: (row) => row.expenseDate ?? row.createdAt,
        cell: ({ getValue }) => formatShortDate(getValue<Date>()),
        meta: { cellClassName: "whitespace-nowrap" },
      },
      {
        accessorKey: "projectName",
        header: "Project",
        cell: ({ getValue }) => {
          const value = getValue<string | null>()
          return value ? toTitleCase(value) : "—"
        },
      },
      {
        accessorKey: "supplierName",
        header: "Supplier",
        cell: ({ getValue }) => {
          const value = getValue<string | null>()
          return value ? toTitleCase(value) : "—"
        },
        meta: { cellClassName: "whitespace-nowrap" },
      },
      {
        accessorKey: "itemCount",
        header: "Receipt",
        cell: ({ getValue }) => {
          const count = getValue<number>()
          return `${count} item${count === 1 ? "" : "s"}`
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "totalCents",
        header: "Amount",
        cell: ({ getValue }) =>
          formatCompactCurrency(getValue<number>(), currency),
        meta: { cellClassName: "whitespace-nowrap tabular-nums" },
      },
    ],
    [currency]
  )

  const table = useReactTable({
    data: expenses,
    columns,
    state: { globalFilter, sorting, pagination },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    autoResetPageIndex: false,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
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
    />
  )
}
