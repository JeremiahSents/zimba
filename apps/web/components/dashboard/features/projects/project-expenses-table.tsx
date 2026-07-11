"use client"

import { useMemo, useState } from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon, ArrowRight01Icon, Search01Icon, Sorting05Icon } from "@hugeicons/core-free-icons"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table"

import { formatCurrency, formatShortDate } from "@/lib/zimba/format"
import type { ExpenseResponse } from "@/lib/zimba/types"

export function ProjectExpensesTable({ expenses }: { expenses: ExpenseResponse[] }) {
  const [globalFilter, setGlobalFilter] = useState("")
  const [sorting, setSorting] = useState<SortingState>([])
  const columns = useMemo<ColumnDef<ExpenseResponse>[]>(
    () => [
      { accessorKey: "date", header: "Date", cell: ({ getValue }) => <span className="text-muted-foreground">{formatShortDate(getValue<string>())}</span> },
      { accessorKey: "item_description", header: "Item / description", cell: ({ row }) => <div className="grid gap-0.5"><span className="font-medium">{row.original.item_description}</span><span className="text-[11px] text-muted-foreground">{row.original.task_name}</span></div> },
      { accessorKey: "supplier_name", header: "Vendor" },
      { accessorKey: "amount", header: "Amount", cell: ({ getValue }) => <span className="font-semibold text-primary">{formatCurrency(getValue<number>())}</span> },
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
      <div className="flex flex-col gap-3 px-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-xs"><HugeiconsIcon icon={Search01Icon} strokeWidth={1.5} className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={globalFilter} onChange={(event) => setGlobalFilter(event.target.value)} placeholder="Search expenses..." aria-label="Search project expenses" className="pl-9" /></div>
        <p className="text-xs text-muted-foreground">{table.getFilteredRowModel().rows.length} expenses</p>
      </div>
      <Table>
        <TableHeader>{table.getHeaderGroups().map((group) => <TableRow key={group.id}>{group.headers.map((header) => <TableHead key={header.id} className={header.id === "amount" ? "text-right" : undefined}>{header.isPlaceholder ? null : <Button type="button" variant="ghost" size="xs" className="inline-flex items-center gap-1.5 px-0 text-inherit" onClick={header.column.getToggleSortingHandler()} disabled={!header.column.getCanSort()}>{flexRender(header.column.columnDef.header, header.getContext())}{header.column.getCanSort() && <HugeiconsIcon icon={Sorting05Icon} strokeWidth={1.5} className="size-3.5" />}</Button>}</TableHead>)}</TableRow>)}</TableHeader>
        <TableBody>{rows.length ? rows.map((row) => <TableRow key={row.id}>{row.getVisibleCells().map((cell) => <TableCell key={cell.id} className={cell.column.id === "amount" ? "text-right" : undefined}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}</TableRow>) : <TableRow><TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">No expenses match your search.</TableCell></TableRow>}</TableBody>
      </Table>
      <div className="flex flex-col gap-3 border-t px-5 pt-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-muted-foreground">Page {table.getState().pagination.pageIndex + 1} of {Math.max(table.getPageCount(), 1)}</p><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}><HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={1.5} />Previous</Button><Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next<HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={1.5} /></Button></div></div>
    </div>
  )
}
