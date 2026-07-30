"use client"

import type { AdminProjectSummaryDto } from "@workspace/api"
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
import Link from "next/link"
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

export function ProjectsTable({
  organizationId,
  projects,
  title,
}: {
  organizationId: string
  projects: AdminProjectSummaryDto[]
  title?: ReactNode
}) {
  const [globalFilter, setGlobalFilter] = useState("")
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 8,
  })

  const columns = useMemo<ColumnDef<AdminProjectSummaryDto>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Project",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <Link
              href={`/organizations/${organizationId}/projects/${row.original.id}`}
              className="font-medium text-foreground text-sm outline-none transition-colors hover:text-primary focus-visible:underline"
            >
              {toTitleCase(row.original.name)}
            </Link>
            <span className="text-foreground/80 text-sm">
              {toTitleCase(row.original.location)}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "budgetCents",
        header: "Budget",
        cell: ({ row }) =>
          formatCompactCurrency(
            row.original.budgetCents,
            row.original.currency
          ),
        meta: { align: "right", cellClassName: "whitespace-nowrap tabular-nums" },
      },
      {
        accessorKey: "spentCents",
        header: "Spent",
        cell: ({ row }) =>
          formatCompactCurrency(
            row.original.spentCents,
            row.original.currency
          ),
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
              <Progress value={pct} className="w-28 shrink-0" />
              <span className="text-sm tabular-nums">{pct}%</span>
            </div>
          )
        },
        meta: { align: "right", cellClassName: "whitespace-nowrap" },
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
    [organizationId]
  )

  const table = useReactTable({
    data: projects,
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
      search={{
        value: globalFilter,
        onChange: setGlobalFilter,
        placeholder: "Search projects...",
        label: "Search projects",
      }}
      emptyMessage="No projects created yet."
      footerNote={`${totalRows} ${totalRows === 1 ? "project" : "projects"}`}
    />
  )
}
