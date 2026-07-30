"use client"

import type { AdminProjectReceiptDto } from "@workspace/api"
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
import { type ReactNode, useMemo, useState } from "react"
import { StatusBadge } from "@/components/status-badge"
import { formatCompactCurrency } from "@/lib/format-currency"

function formatShortDate(dateInput: Date | string) {
  return new Date(dateInput).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function ProjectReceiptsTable({
  receipts,
  currency,
  title,
}: {
  receipts: AdminProjectReceiptDto[]
  currency: string
  title?: ReactNode
}) {
  const [globalFilter, setGlobalFilter] = useState("")
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 8,
  })

  const columns = useMemo<ColumnDef<AdminProjectReceiptDto>[]>(
    () => [
      {
        accessorKey: "supplierName",
        header: "Supplier",
        cell: ({ getValue }) => {
          const value = getValue<string | null>()
          return value ?? "—"
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "totalCents",
        header: "Total",
        cell: ({ getValue }) =>
          formatCompactCurrency(getValue<number>(), currency),
        meta: { align: "right", cellClassName: "whitespace-nowrap tabular-nums" },
      },
      {
        accessorKey: "paidCents",
        header: "Paid",
        cell: ({ getValue }) =>
          formatCompactCurrency(getValue<number>(), currency),
        meta: { align: "right", cellClassName: "whitespace-nowrap tabular-nums" },
      },
      {
        accessorKey: "date",
        header: "Date",
        accessorFn: (row) => row.expenseDate ?? row.createdAt,
        cell: ({ getValue }) => formatShortDate(getValue<Date>()),
        meta: { cellClassName: "whitespace-nowrap" },
      },
    ],
    [currency]
  )

  const table = useReactTable({
    data: receipts,
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
      pagination="always"
      search={{
        value: globalFilter,
        onChange: setGlobalFilter,
        placeholder: "Search receipts...",
        label: "Search receipts",
      }}
      emptyMessage="No receipts logged yet."
      footerNote={`${totalRows} ${totalRows === 1 ? "receipt" : "receipts"}`}
    />
  )
}
