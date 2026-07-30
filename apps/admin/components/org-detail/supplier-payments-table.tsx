"use client"

import type { AdminSupplierPaymentDto } from "@workspace/api"
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
import { formatCompactCurrency } from "@/lib/format-currency"

function formatShortDate(dateInput: Date | string) {
  return new Date(dateInput).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function SupplierPaymentsTable({
  payments,
  title,
}: {
  payments: AdminSupplierPaymentDto[]
  title?: ReactNode
}) {
  const [globalFilter, setGlobalFilter] = useState("")
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 8,
  })

  const columns = useMemo<ColumnDef<AdminSupplierPaymentDto>[]>(
    () => [
      {
        accessorKey: "amountCents",
        header: "Amount",
        cell: ({ row }) =>
          formatCompactCurrency(
            row.original.amountCents,
            row.original.currency
          ),
        meta: { align: "right", cellClassName: "whitespace-nowrap tabular-nums" },
      },
      {
        accessorKey: "method",
        header: "Method",
        cell: ({ getValue }) => {
          const value = getValue<string | null>()
          return value ? <span className="capitalize">{value}</span> : "—"
        },
      },
      {
        accessorKey: "reference",
        header: "Reference",
        cell: ({ getValue }) => getValue<string | null>() ?? "—",
      },
      {
        accessorKey: "date",
        header: "Date",
        accessorFn: (row) => row.paymentDate ?? row.createdAt,
        cell: ({ getValue }) => formatShortDate(getValue<Date>()),
        meta: { cellClassName: "whitespace-nowrap" },
      },
    ],
    []
  )

  const table = useReactTable({
    data: payments,
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
      onRowClick={(row) => {
        const url = row.original.receiptFileUrl
        if (url) window.open(url, "_blank", "noopener,noreferrer")
      }}
      search={{
        value: globalFilter,
        onChange: setGlobalFilter,
        placeholder: "Search payments...",
        label: "Search payments",
      }}
      emptyMessage="No payments recorded for this supplier yet."
      footerNote={`${totalRows} ${totalRows === 1 ? "payment" : "payments"}`}
    />
  )
}
