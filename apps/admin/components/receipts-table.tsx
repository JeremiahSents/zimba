"use client"

import { EyeIcon, Search01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import Link from "next/link"
import { useState } from "react"
import { StatusBadge } from "@/components/status-badge"
import { formatCreatedDate } from "@/lib/format-currency"

export type ReceiptItem = {
  id: string
  paymentStatus: string
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

  const columns: ColumnDef<ReceiptItem>[] = [
    {
      accessorKey: "organizationName",
      header: ({ column }) => (
        <button
          type="button"
          className="font-semibold text-xs text-foreground tracking-tight hover:text-primary transition-colors cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Organization
        </button>
      ),
      cell: ({ row }) => (
        <span className="font-semibold text-foreground text-sm">
          {row.original.organizationName}
        </span>
      ),
    },
    {
      accessorKey: "projectName",
      header: ({ column }) => (
        <button
          type="button"
          className="font-semibold text-xs text-foreground tracking-tight hover:text-primary transition-colors cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Project
        </button>
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground text-sm">
          {row.original.projectName || "Unassigned"}
        </span>
      ),
    },
    {
      accessorKey: "supplierName",
      header: ({ column }) => (
        <button
          type="button"
          className="font-semibold text-xs text-foreground tracking-tight hover:text-primary transition-colors cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Supplier
        </button>
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground text-xs sm:text-sm font-medium">
          {row.original.supplierName || "—"}
        </span>
      ),
    },
    {
      accessorKey: "paymentStatus",
      header: ({ column }) => (
        <button
          type="button"
          className="font-semibold text-xs text-foreground tracking-tight hover:text-primary transition-colors cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Payment Status
        </button>
      ),
      cell: ({ row }) => <StatusBadge status={row.original.paymentStatus} />,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <button
          type="button"
          className="font-semibold text-xs text-foreground tracking-tight hover:text-primary transition-colors cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
        </button>
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground text-xs sm:text-sm">
          {formatCreatedDate(row.original.expenseDate || row.original.createdAt)}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right font-semibold text-xs">Action</div>,
      cell: ({ row }) => (
        <div className="text-right">
          <Button variant="outline" size="sm" asChild className="h-8 gap-1.5 rounded-lg px-2.5">
            <Link href={`/receipts/${row.original.id}`}>
              <HugeiconsIcon icon={EyeIcon} className="size-3.5 text-primary" />
              <span>View</span>
            </Link>
          </Button>
        </div>
      ),
    },
  ]

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
    (table.getColumn("paymentStatus")?.getFilterValue() as string) ?? "all"

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative min-w-48 max-w-sm flex-1">
            <HugeiconsIcon
              icon={Search01Icon}
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Search receipts by org, project, or supplier…"
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="h-9 pl-9 rounded-xl"
            />
          </div>
          <Select
            value={statusFilterValue}
            onValueChange={(value) => {
              table
                .getColumn("paymentStatus")
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
        </div>

        <div className="text-muted-foreground text-xs font-medium">
          Showing {table.getFilteredRowModel().rows.length} of {data.length} receipts
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
        <Table>
          <TableHeader className="bg-muted/30">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="py-2.5">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="transition-colors hover:bg-muted/40"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-muted-foreground"
                >
                  No receipts found matching your criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-8 rounded-lg text-xs"
          >
            Previous
          </Button>
          <span className="text-muted-foreground text-xs font-medium px-2">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-8 rounded-lg text-xs"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
