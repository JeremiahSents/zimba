"use client"

import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Search01Icon,
  Sorting05Icon,
} from "@hugeicons/core-free-icons"
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

import { formatCurrency, formatShortDate } from "@/lib/format"
import type { ExpenseResponse } from "@/lib/types"

const statusPillClasses = {
  Partial: "border-amber-200 bg-amber-50 text-amber-700",
  Full: "border-green-200 bg-green-50 text-green-700",
  "Not paid": "border-slate-200 bg-slate-50 text-slate-600",
}

export function ProjectExpensesTable({
  expenses,
}: {
  expenses: ExpenseResponse[]
}) {
  const [globalFilter, setGlobalFilter] = useState("")
  const [sorting, setSorting] = useState<SortingState>([])
  const columns = useMemo<ColumnDef<ExpenseResponse>[]>(
    () => [
      {
        accessorKey: "item_description",
        header: "Item",
        cell: ({ getValue }) => (
          <span className="font-medium text-foreground">
            {getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: "task_name",
        header: "Category",
        cell: ({ getValue }) => (
          <span className="text-muted-foreground">{getValue<string>()}</span>
        ),
      },
      {
        accessorKey: "supplier_name",
        header: "Supplier",
        cell: ({ getValue }) => getValue<string>(),
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ getValue }) => formatCurrency(getValue<number>()),
      },
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ getValue }) => (
          <span className="text-muted-foreground tabular-nums">
            {formatShortDate(getValue<string>())}
          </span>
        ),
      },
      {
        id: "status",
        accessorFn: (expense) => expense.status ?? "Full",
        header: "Status",
        cell: ({ getValue }) => {
          const status = getValue<"Partial" | "Full" | "Not paid">()
          return (
            <span
              className={`inline-flex rounded-md border px-1.5 py-0.5 font-medium text-[10px] ${statusPillClasses[status]}`}
            >
              {status}
            </span>
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
    initialState: { pagination: { pageSize: 5 } },
  })
  const rows = table.getRowModel().rows

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-xs">
          <HugeiconsIcon
            icon={Search01Icon}
            strokeWidth={1.5}
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
            placeholder="Search expenses..."
            aria-label="Search project expenses"
            className="pl-9"
          />
        </div>
        <p className="text-muted-foreground text-xs">
          {table.getFilteredRowModel().rows.length}{" "}
          {table.getFilteredRowModel().rows.length === 1
            ? "expense"
            : "expenses"}
        </p>
      </div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id}>
              {group.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={header.id === "amount" ? "text-right" : undefined}
                >
                  {header.isPlaceholder ? null : (
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      className={`inline-flex items-center gap-1.5 text-inherit ${header.id === "amount" ? "ml-auto" : ""}`}
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
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {rows.length ? (
            rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={
                      cell.column.id === "amount"
                        ? "text-right font-semibold"
                        : undefined
                    }
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                No expenses match your search.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground text-xs">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {Math.max(table.getPageCount(), 1)}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={1.5} />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
            <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={1.5} />
          </Button>
        </div>
      </div>
    </div>
  )
}
