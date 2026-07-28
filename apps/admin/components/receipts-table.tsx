"use client"

import {
  type ColumnDef,
  type ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { DataTable } from "@workspace/ui/components/data-table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { useMemo, useState } from "react"
import { StatusBadge } from "@/components/status-badge"
import { formatCreatedDate } from "@/lib/format-currency"

export type ReceiptItem = {
  id: string
  status: string
  expenseDate: Date | string | null
  createdAt: Date | string
  organizationName: string
  projectName: string | null
  supplierName: string | null
}

interface ReceiptsTableProps {
  data: ReceiptItem[]
}

export function ReceiptsTable({ data }: ReceiptsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState("")

  const columns = useMemo<ColumnDef<ReceiptItem>[]>(
    () => [
      {
        accessorKey: "organizationName",
        header: "Organization",
        cell: ({ row }) => (
          <span className="font-semibold text-foreground text-sm">
            {row.original.organizationName}
          </span>
        ),
      },
      {
        accessorKey: "projectName",
        header: "Project",
        cell: ({ row }) => (
          <span className="font-medium text-foreground text-sm">
            {row.original.projectName || "Unassigned"}
          </span>
        ),
      },
      {
        accessorKey: "supplierName",
        header: "Supplier",
        cell: ({ row }) => (
          <span className="font-medium text-muted-foreground text-xs sm:text-sm">
            {row.original.supplierName || "—"}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Payment Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "createdAt",
        header: "Date",
        cell: ({ row }) => (
          <span className="font-medium text-foreground text-xs sm:text-sm">
            {formatCreatedDate(
              row.original.expenseDate || row.original.createdAt
            )}
          </span>
        ),
      },
    ],
    []
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  const statusFilterValue =
    (table.getColumn("status")?.getFilterValue() as string) ?? "all"

  const totalRows = table.getFilteredRowModel().rows.length

  return (
    <DataTable
      table={table}
      rowNumbers
      search={{
        value: globalFilter,
        onChange: setGlobalFilter,
        placeholder: "Search receipts by org, project, or supplier…",
        label: "Search receipts",
      }}
      toolbar={
        <Select
          value={statusFilterValue}
          onValueChange={(value) => {
            table
              .getColumn("status")
              ?.setFilterValue(value === "all" ? undefined : value)
          }}
        >
          <SelectTrigger size="sm" className="h-9 w-40 rounded-xl">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="unpaid">Unpaid</SelectItem>
            <SelectItem value="partially_paid">Partially Paid</SelectItem>
          </SelectContent>
        </Select>
      }
      emptyMessage="No receipts found matching your criteria."
      footerNote={`Showing ${totalRows} of ${data.length} receipts`}
    />
  )
}
