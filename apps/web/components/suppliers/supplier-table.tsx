"use client"

import { Sorting05Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { useMemo, useState } from "react"
import { formatCurrency } from "@/lib/format"
import type { SupplierResponse } from "@/lib/types"

export function SupplierTable({
  suppliers,
}: {
  suppliers: SupplierResponse[]
}) {
  const [filter, setFilter] = useState("")
  const [sorting, setSorting] = useState<SortingState>([])
  const columns = useMemo<ColumnDef<SupplierResponse>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Supplier",
        cell: ({ row }) => <p className="font-medium">{row.original.name}</p>,
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ getValue }) => {
          const category = getValue<string>()
          const categoryClasses = {
            materials: "border-blue-500 text-blue-600",
            labour: "border-amber-500 text-amber-600",
            equipment: "border-violet-500 text-violet-600",
            services: "border-teal-500 text-teal-600",
          }
          return (
            <span
              className={`inline-flex rounded-lg border px-1.5 py-0.5 font-medium text-[10px] capitalize ${categoryClasses[category as keyof typeof categoryClasses] ?? "border-muted-foreground/40 text-muted-foreground"}`}
            >
              {category}
            </span>
          )
        },
      },
      { accessorKey: "payments", header: "Payments" },
      {
        accessorKey: "amount",
        header: "Paid this month",
        cell: ({ getValue }) => (
          <span className="font-semibold">
            {formatCurrency(getValue<number>())}
          </span>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: () => (
          <span className="inline-flex rounded-lg border border-green-500 px-1.5 py-0.5 font-medium text-[10px] text-green-600">
            Active
          </span>
        ),
        enableSorting: false,
      },
    ],
    []
  )
  const table = useReactTable({
    data: suppliers,
    columns,
    state: { globalFilter: filter, sorting },
    onGlobalFilterChange: setFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 5 } },
  })
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Input
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          placeholder="Search suppliers..."
          className="max-w-xs"
        />
        <span className="text-muted-foreground text-xs">
          {table.getFilteredRowModel().rows.length} suppliers
        </span>
      </div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id}>
              {group.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={header.id === "name" ? undefined : "border-l"}
                >
                  <Button
                    variant="ghost"
                    size="xs"
                    className="px-0 text-inherit"
                    onClick={header.column.getToggleSortingHandler()}
                    disabled={!header.column.getCanSort()}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {header.column.getCanSort() && (
                      <HugeiconsIcon
                        icon={Sorting05Icon}
                        strokeWidth={1.5}
                        className="size-3.5"
                      />
                    )}
                  </Button>
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className={cell.column.id === "name" ? undefined : "border-l"}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between border-t pt-3">
        <span className="text-muted-foreground text-xs">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {Math.max(table.getPageCount(), 1)}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
