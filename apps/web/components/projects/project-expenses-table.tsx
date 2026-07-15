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
import { useMemo, useState } from "react"

import {
  MobileDataCard,
  MobileDataMeta,
} from "@/components/shared/mobile-data-card"
import { ResponsiveDataView } from "@/components/shared/responsive-data-view"
import { formatCurrency, formatShortDate } from "@/lib/format"
import type { ExpenseResponse, ExpenseStatus } from "@/lib/types"

const statusPillClasses = {
  Partial: "border-amber-200 bg-amber-50 text-amber-700",
  Full: "border-green-200 bg-green-50 text-green-700",
  "Not paid": "border-slate-200 bg-slate-50 text-slate-600",
}

const columnWidths: Record<string, string> = {
  item_description: "w-[23%]",
  task_name: "w-[13%]",
  supplier_name: "w-[18%]",
  amount: "w-[16%]",
  date: "w-[14%]",
  status: "w-[14%]",
}

export function ProjectExpensesTable({
  expenses,
  onStatusChange,
}: {
  expenses: ExpenseResponse[]
  onStatusChange: (expenseId: number, status: ExpenseStatus) => void
}) {
  const [globalFilter, setGlobalFilter] = useState("")
  const [sorting, setSorting] = useState<SortingState>([])
  const columns = useMemo<ColumnDef<ExpenseResponse>[]>(
    () => [
      {
        accessorKey: "item_description",
        header: "Item",
        cell: ({ getValue }) => (
          <span className="block truncate font-medium text-foreground">
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
        cell: ({ getValue }) => (
          <span className="block truncate text-muted-foreground">
            {getValue<string>()}
          </span>
        ),
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
          <span className="whitespace-nowrap text-foreground tabular-nums">
            {formatShortDate(getValue<string>())}
          </span>
        ),
      },
      {
        id: "status",
        accessorFn: (expense) => expense.status ?? "Full",
        header: "Status",
        cell: ({ getValue, row }) => {
          const status = getValue<ExpenseStatus>()
          return (
            <Select
              value={status}
              onValueChange={(value) =>
                onStatusChange(
                  row.original.id,
                  (value as ExpenseStatus) ?? "Full"
                )
              }
            >
              <SelectTrigger
                size="sm"
                className={`w-full min-w-0 rounded-md px-2 font-medium text-[10px] ${statusPillClasses[status]}`}
                aria-label={`Update payment status for ${row.original.item_description}`}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Full">Paid in full</SelectItem>
                <SelectItem value="Partial">Partial</SelectItem>
                <SelectItem value="Not paid">Not paid</SelectItem>
              </SelectContent>
            </Select>
          )
        },
      },
    ],
    [onStatusChange]
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
    <div className="space-y-5 [&_[data-slot=table-container]]:overflow-x-auto">
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
      <ResponsiveDataView
        mobile={
          rows.length ? (
            <div className="space-y-3">
              {rows.map((row) => {
                const expense = row.original
                const status = expense.status ?? "Full"
                return (
                  <MobileDataCard
                    key={row.id}
                    eyebrow={expense.task_name}
                    title={expense.item_description}
                    value={formatCurrency(expense.amount)}
                    status={
                      <Select
                        value={status}
                        onValueChange={(value) =>
                          onStatusChange(
                            expense.id,
                            (value as ExpenseStatus) ?? "Full"
                          )
                        }
                      >
                        <SelectTrigger
                          className={`w-full max-w-40 rounded-lg px-3 font-medium text-xs ${statusPillClasses[status]}`}
                          aria-label={`Update payment status for ${expense.item_description}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Full">Paid in full</SelectItem>
                          <SelectItem value="Partial">Partial</SelectItem>
                          <SelectItem value="Not paid">Not paid</SelectItem>
                        </SelectContent>
                      </Select>
                    }
                  >
                    <dl className="grid grid-cols-2 gap-4">
                      <MobileDataMeta label="Supplier">
                        {expense.supplier_name}
                      </MobileDataMeta>
                      <MobileDataMeta label="Date">
                        {formatShortDate(expense.date)}
                      </MobileDataMeta>
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
          <Table className="min-w-[58rem] table-fixed border-y">
            <TableHeader className="bg-muted/25">
              {table.getHeaderGroups().map((group) => (
                <TableRow key={group.id}>
                  {group.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={`min-w-0 border-l px-4 first:border-l-0 ${columnWidths[header.id] ?? ""} ${header.id === "amount" ? "text-right" : ""}`}
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
                  <TableRow key={row.id} className="hover:bg-muted/25">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={`min-w-0 overflow-hidden border-l px-4 py-4 align-middle first:border-l-0 ${cell.column.id === "amount" ? "text-right font-semibold" : ""}`}
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
      <div className="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground text-xs">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {Math.max(table.getPageCount(), 1)}
        </p>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
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
