"use client"

import {
  type ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { DataTable } from "@workspace/ui/components/data-table"
import { Progress } from "@workspace/ui/components/progress"
import { type ReactNode, useMemo, useState } from "react"

import {
  MobileDataCard,
  MobileDataMeta,
} from "@/components/shared/mobile-data-card"
import { formatCurrency, formatPercent } from "@/lib/format"
import type { ProjectDashboardResponse } from "@/lib/types"

export function ProjectBudgetTable({
  projects,
  title,
  action,
}: {
  projects: ProjectDashboardResponse[]
  title?: ReactNode
  /** Rendered at the end of the toolbar, after the search field. */
  action?: ReactNode
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
        meta: {          cellClassName: "tabular-nums whitespace-nowrap",
        },
      },
      {
        accessorKey: "spent",
        header: "Spent",
        cell: ({ getValue }) => formatCurrency(getValue<number>()),
        meta: {          cellClassName: "tabular-nums whitespace-nowrap",
        },
      },
      {
        accessorKey: "remaining",
        header: "Remaining",
        cell: ({ getValue }) => formatCurrency(getValue<number>()),
        meta: {          cellClassName: "tabular-nums whitespace-nowrap",
        },
      },
      {
        accessorKey: "pct",
        header: "Utilization",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Progress value={row.original.pct} className="w-28 shrink-0" />
            <span className="text-xs tabular-nums">
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
    <DataTable
      table={table}
      title={title}
      pagination="never"
      toolbar={action}
      search={{
        value: filter,
        onChange: setFilter,
        placeholder: "Search project budgets...",
        label: "Search project budgets",
      }}
      emptyMessage="No project budgets match your search."
      renderMobileRow={(row) => {
        const project = row.original
        return (
          <MobileDataCard
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
      }}
    />
  )
}
