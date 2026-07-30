"use client"

import type { AdminSupplierWithStatsDto } from "@workspace/api"
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
import { useRouter } from "next/navigation"
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

export function SuppliersTable({
  suppliers,
  currency,
  organizationId,
  title,
}: {
  suppliers: AdminSupplierWithStatsDto[]
  currency: string
  organizationId: string
  title?: ReactNode
}) {
  const router = useRouter()
  const [globalFilter, setGlobalFilter] = useState("")
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 8,
  })

  const columns = useMemo<ColumnDef<AdminSupplierWithStatsDto>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Supplier",
        cell: ({ getValue }) => (
          <span className="font-medium text-foreground text-sm">
            {toTitleCase(getValue<string>())}
          </span>
        ),
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ getValue }) => {
          const value = getValue<string | null>()
          return value ? (
            <span className="capitalize">{toTitleCase(value)}</span>
          ) : (
            "—"
          )
        },
      },
      {
        accessorKey: "contact",
        header: "Contact",
        accessorFn: (row) => row.phone ?? row.email ?? "—",
        cell: ({ row }) => row.original.phone ?? row.original.email ?? "—",
      },
      {
        accessorKey: "paymentCount",
        header: "Payments",
        cell: ({ getValue }) => getValue<number>(),
        meta: { align: "right", cellClassName: "tabular-nums" },
      },
      {
        accessorKey: "totalPaidCents",
        header: "Total Paid",
        cell: ({ getValue }) =>
          formatCompactCurrency(getValue<number>(), currency),
        meta: { align: "right", cellClassName: "whitespace-nowrap tabular-nums" },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ getValue }) => formatShortDate(getValue<Date>()),
        meta: { cellClassName: "whitespace-nowrap" },
      },
    ],
    [currency]
  )

  const table = useReactTable({
    data: suppliers,
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
      onRowClick={(row) =>
        router.push(
          `/organizations/${organizationId}/suppliers/${row.original.id}`
        )
      }
      search={{
        value: globalFilter,
        onChange: setGlobalFilter,
        placeholder: "Search suppliers...",
        label: "Search suppliers",
      }}
      emptyMessage="No suppliers registered yet."
      footerNote={`${totalRows} ${totalRows === 1 ? "supplier" : "suppliers"}`}
    />
  )
}
