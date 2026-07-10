"use client"

import { useMemo, useState } from "react"
import {
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table"

import { Input } from "@workspace/ui/components/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { Progress } from "@workspace/ui/components/progress"

import { formatCurrency, formatPercent } from "@/lib/zimba/format"
import type { ProjectDashboardResponse } from "@/lib/zimba/types"

export function ProjectBudgetTable({
  projects,
}: {
  projects: ProjectDashboardResponse[]
}) {
  const [filter, setFilter] = useState("")
  const columns = useMemo<ColumnDef<ProjectDashboardResponse>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Project",
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">
              {row.original.location}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "budget",
        header: "Allocated",
        cell: ({ getValue }) => formatCurrency(getValue<number>()),
      },
      {
        accessorKey: "spent",
        header: "Spent",
        cell: ({ getValue }) => formatCurrency(getValue<number>()),
      },
      {
        accessorKey: "remaining",
        header: "Remaining",
        cell: ({ getValue }) => formatCurrency(getValue<number>()),
      },
      {
        accessorKey: "pct",
        header: "Utilization",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Progress value={row.original.pct} className="w-28 shrink-0" />
            <span className="text-xs font-medium tabular-nums">
              {formatPercent(row.original.pct)}
            </span>
          </div>
        ),
      },
    ],
    []
  )
  const table = useReactTable({
    data: projects,
    columns,
    state: { globalFilter: filter },
    onGlobalFilterChange: setFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <div className="space-y-4">
      <Input
        value={filter}
        onChange={(event) => setFilter(event.target.value)}
        placeholder="Search project budgets..."
        className="max-w-xs"
      />
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id}>
              {group.headers.map((header) => (
                <TableHead key={header.id}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
