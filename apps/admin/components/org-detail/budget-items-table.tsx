"use client"

import type { AdminBudgetItemDto } from "@workspace/api"
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
import { Progress } from "@workspace/ui/components/progress"
import { type ReactNode, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { formatCompactCurrency } from "@/lib/format-currency"

export function BudgetItemsTable({
  items,
  currency,
  organizationId,
  projectId,
  title,
}: {
  items: AdminBudgetItemDto[]
  currency: string
  organizationId: string
  projectId: string
  title?: ReactNode
}) {
  const router = useRouter()
  const [globalFilter, setGlobalFilter] = useState("")
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 8,
  })

  const columns = useMemo<ColumnDef<AdminBudgetItemDto>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Item",
        cell: ({ getValue }) => (
          <span className="font-medium text-foreground text-sm">
            {getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: "budgetCents",
        header: "Budget",
        cell: ({ getValue }) =>
          formatCompactCurrency(getValue<number>(), currency),
        meta: { align: "right", cellClassName: "whitespace-nowrap tabular-nums" },
      },
      {
        accessorKey: "spentCents",
        header: "Spent",
        cell: ({ getValue }) =>
          formatCompactCurrency(getValue<number>(), currency),
        meta: { align: "right", cellClassName: "whitespace-nowrap tabular-nums" },
      },
      {
        id: "remaining",
        accessorFn: (row) => row.budgetCents - row.spentCents,
        header: "Remaining",
        cell: ({ getValue }) =>
          formatCompactCurrency(getValue<number>(), currency),
        meta: { align: "right", cellClassName: "whitespace-nowrap tabular-nums" },
      },
      {
        id: "utilization",
        accessorFn: (row) =>
          row.budgetCents > 0
            ? Math.min(100, Math.round((row.spentCents / row.budgetCents) * 100))
            : 0,
        header: "Utilization",
        cell: ({ getValue }) => {
          const pct = getValue<number>()
          return (
            <div className="flex items-center justify-end gap-3">
              <Progress value={pct} className="w-24 shrink-0" />
              <span className="text-sm tabular-nums">{pct}%</span>
            </div>
          )
        },
        meta: { align: "right", cellClassName: "whitespace-nowrap" },
      },
    ],
    [currency]
  )

  const table = useReactTable({
    data: items,
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
          `/organizations/${organizationId}/projects/${projectId}/budget-items/${row.original.id}`
        )
      }
      search={{
        value: globalFilter,
        onChange: setGlobalFilter,
        placeholder: "Search budget items...",
        label: "Search budget items",
      }}
      emptyMessage="No budget items allocated yet."
      footerNote={`${totalRows} ${totalRows === 1 ? "item" : "items"}`}
    />
  )
}
