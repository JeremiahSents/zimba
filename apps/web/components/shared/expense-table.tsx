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

import {
  MobileDataCard,
  MobileDataMeta,
} from "@/components/shared/mobile-data-card"
import { ResponsiveDataView } from "@/components/shared/responsive-data-view"
import { formatCurrency, formatShortDate } from "@/lib/format"
import type { ExpenseTableRow } from "@/lib/types"

export function ExpenseTable({ expenses }: { expenses: ExpenseTableRow[] }) {
  const [globalFilter, setGlobalFilter] = useState("")
  const [sorting, setSorting] = useState<SortingState>([])

  const columns = useMemo<ColumnDef<ExpenseTableRow>[]>(
    () => [
      {
        id: "number",
        header: "#",
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.index + 1}</span>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ getValue }) => formatShortDate(getValue<string>()),
      },
      { accessorKey: "project_name", header: "Project" },
      { accessorKey: "task_name", header: "Task" },
      { accessorKey: "supplier_name", header: "Supplier" },
      { accessorKey: "item_description", header: "Item" },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ getValue }) => formatCurrency(getValue<number>()),
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

  const visibleRows = table.getRowModel().rows
  const totalRows = table.getFilteredRowModel().rows.length

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
            aria-label="Search expenses"
            className="pl-9"
          />
        </div>
        <p className="text-muted-foreground text-xs">
          {totalRows} {totalRows === 1 ? "expense" : "expenses"}
        </p>
      </div>

      <ResponsiveDataView
        mobile={
          visibleRows.length > 0 ? (
            <div className="space-y-3">
              {visibleRows.map((row) => {
                const expense = row.original
                return (
                  <MobileDataCard
                    key={row.id}
                    eyebrow={expense.project_name}
                    title={expense.item_description}
                    value={formatCurrency(expense.amount)}
                    status={
                      <span className="inline-flex rounded-full border bg-muted/50 px-2 py-1 font-medium text-[10px] text-muted-foreground">
                        {expense.status}
                      </span>
                    }
                  >
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                      <MobileDataMeta label="Task">
                        {expense.task_name}
                      </MobileDataMeta>
                      <MobileDataMeta label="Date">
                        {formatShortDate(expense.date)}
                      </MobileDataMeta>
                      <div className="col-span-2">
                        <MobileDataMeta label="Supplier">
                          {expense.supplier_name}
                        </MobileDataMeta>
                      </div>
                    </dl>
                  </MobileDataCard>
                )
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground text-sm">
              No expenses match your search.
            </div>
          )
        }
        desktop={
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : (
                        <Button
                          type="button"
                          variant="ghost"
                          size="xs"
                          className="inline-flex items-center gap-1.5 text-inherit"
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
              {visibleRows.length > 0 ? (
                visibleRows.map((row) => (
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
                    className="h-24 text-center text-muted-foreground"
                  >
                    No expenses match your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        }
      />

      <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground text-xs">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {Math.max(table.getPageCount(), 1)}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={1.5} />
            Previous
          </Button>
          <Button
            variant="default"
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
