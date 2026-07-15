"use client"

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Input } from "@workspace/ui/components/input"
import { Progress } from "@workspace/ui/components/progress"
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
import { formatCurrency, formatPercent } from "@/lib/format"
import type { ProjectDashboardResponse } from "@/lib/types"

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
            <p className="text-muted-foreground text-xs">
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
            <span className="font-medium text-xs tabular-nums">
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
      <ResponsiveDataView
        mobile={
          <div className="space-y-3">
            {table.getRowModel().rows.map((row) => {
              const project = row.original
              return (
                <MobileDataCard
                  key={row.id}
                  eyebrow={project.location}
                  title={project.name}
                  value={formatPercent(project.pct)}
                >
                  <Progress value={project.pct} className="mb-4" />
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                    <MobileDataMeta label="Allocated">
                      {formatCurrency(project.budget)}
                    </MobileDataMeta>
                    <MobileDataMeta label="Spent">
                      {formatCurrency(project.spent)}
                    </MobileDataMeta>
                    <div className="col-span-2">
                      <MobileDataMeta label="Remaining">
                        {formatCurrency(project.remaining)}
                      </MobileDataMeta>
                    </div>
                  </dl>
                </MobileDataCard>
              )
            })}
          </div>
        }
        desktop={
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
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        }
      />
    </div>
  )
}
