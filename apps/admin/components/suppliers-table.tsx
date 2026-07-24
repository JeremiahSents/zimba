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
import { Badge } from "@workspace/ui/components/badge"
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

export type SupplierItem = {
  id: string
  name: string
  phone: string | null
  email: string | null
  category: string | null
  status: string
  createdAt: Date | string
  organizationName: string
}

interface SuppliersTableProps {
  data: SupplierItem[]
}

export function SuppliersTable({ data }: SuppliersTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState("")

  const columns: ColumnDef<SupplierItem>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <button
          type="button"
          className="font-semibold text-xs text-foreground tracking-tight hover:text-primary transition-colors cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Supplier Name
        </button>
      ),
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground text-sm">
            {row.original.name}
          </span>
          {row.original.category && (
            <span className="text-muted-foreground text-xs capitalize">
              {row.original.category}
            </span>
          )}
        </div>
      ),
    },
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
        <span className="font-medium text-foreground text-sm">
          {row.original.organizationName}
        </span>
      ),
    },
    {
      accessorKey: "category",
      header: ({ column }) => (
        <button
          type="button"
          className="font-semibold text-xs text-foreground tracking-tight hover:text-primary transition-colors cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Category
        </button>
      ),
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize font-medium text-xs">
          {row.original.category || "General"}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <button
          type="button"
          className="font-semibold text-xs text-foreground tracking-tight hover:text-primary transition-colors cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
        </button>
      ),
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "phone",
      header: "Contact",
      cell: ({ row }) => (
        <div className="flex flex-col text-xs text-muted-foreground">
          {row.original.phone && (
            <span className="font-medium text-foreground">{row.original.phone}</span>
          )}
          {row.original.email && <span>{row.original.email}</span>}
          {!row.original.phone && !row.original.email && <span>—</span>}
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <button
          type="button"
          className="font-semibold text-xs text-foreground tracking-tight hover:text-primary transition-colors cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created
        </button>
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground text-xs sm:text-sm">
          {formatCreatedDate(row.original.createdAt)}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right font-semibold text-xs">Action</div>,
      cell: ({ row }) => (
        <div className="text-right">
          <Button variant="outline" size="sm" asChild className="h-8 gap-1.5 rounded-lg px-2.5">
            <Link href={`/suppliers/${row.original.id}`}>
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
    (table.getColumn("status")?.getFilterValue() as string) ?? "all"

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
              placeholder="Search suppliers by name, category, or org…"
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="h-9 pl-9 rounded-xl"
            />
          </div>
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
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-muted-foreground text-xs font-medium">
          Showing {table.getFilteredRowModel().rows.length} of {data.length} suppliers
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
                  No suppliers found matching your criteria.
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
