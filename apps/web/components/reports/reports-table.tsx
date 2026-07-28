"use client"

import { Download01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  type ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { Button } from "@workspace/ui/components/button"
import { DataTable } from "@workspace/ui/components/data-table"
import { Progress } from "@workspace/ui/components/progress"
import { type ReactNode, useMemo, useState } from "react"
import { exportProjectPdf } from "@/components/reports/export-pdf"
import {
  MobileDataCard,
  MobileDataMeta,
} from "@/components/shared/mobile-data-card"
import { formatCurrency, formatPercent } from "@/lib/format"
import type { ProjectDashboardResponse } from "@/lib/types"

export function ReportsTable({
  projects,
  title,
}: {
  projects: ProjectDashboardResponse[]
  title?: ReactNode
}) {
  const [filter, setFilter] = useState("")
  const [sorting, setSorting] = useState<SortingState>([])

  const columns = useMemo<ColumnDef<ProjectDashboardResponse>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Project",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium text-foreground">
              {row.original.name}
            </span>
            {row.original.location && (
              <span className="text-muted-foreground text-xs">
                {row.original.location}
              </span>
            )}
          </div>
        ),
      },
      {
        accessorKey: "budget",
        header: "Budget",
        cell: ({ getValue }) => formatCurrency(getValue<number>()),
        meta: { cellClassName: "tabular-nums whitespace-nowrap" },
      },
      {
        accessorKey: "remaining",
        header: "Remaining",
        cell: ({ getValue }) => formatCurrency(getValue<number>()),
        meta: { cellClassName: "tabular-nums whitespace-nowrap" },
      },
      {
        accessorKey: "pct",
        header: "Utilization",
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <Progress value={row.original.pct} className="h-2 w-24" />
            <span className="font-medium text-xs tabular-nums">
              {formatPercent(row.original.pct)}
            </span>
          </div>
        ),
      },
      {
        id: "actions",
        header: "Action",
        enableSorting: false,
        cell: ({ row }) => (
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 rounded-lg px-2.5 transition-colors hover:bg-primary/10 hover:text-primary"
            onClick={() => exportProjectPdf(row.original)}
          >
            <HugeiconsIcon
              icon={Download01Icon}
              strokeWidth={1.7}
              className="size-3.5"
            />
            <span>Export PDF</span>
          </Button>
        ),
      },
    ],
    []
  )

  const table = useReactTable({
    data: projects,
    columns,
    state: { globalFilter: filter, sorting },
    onGlobalFilterChange: setFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  })

  const totalRows = table.getFilteredRowModel().rows.length

  return (
    <DataTable
      table={table}
      title={title}
      rowNumbers
      search={{
        value: filter,
        onChange: setFilter,
        placeholder: "Search reports...",
        label: "Search project reports",
      }}
      emptyMessage="No project reports match your search."
      footerNote={`Showing ${totalRows} of ${projects.length} project reports`}
      renderMobileRow={(row) => {
        const project = row.original
        return (
          <MobileDataCard
            eyebrow="Project report"
            title={project.name}
            value={formatPercent(project.pct)}
          >
            <Progress value={project.pct} className="mb-4" />
            <dl className="grid grid-cols-2 gap-4">
              <MobileDataMeta label="Budget">
                {formatCurrency(project.budget)}
              </MobileDataMeta>
              <MobileDataMeta label="Remaining">
                {formatCurrency(project.remaining)}
              </MobileDataMeta>
            </dl>
            <div className="mt-4 flex justify-end border-t pt-3">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 rounded-lg text-xs"
                onClick={() => exportProjectPdf(project)}
              >
                <HugeiconsIcon
                  icon={Download01Icon}
                  strokeWidth={1.7}
                  className="size-3.5"
                />
                <span>Export PDF</span>
              </Button>
            </div>
          </MobileDataCard>
        )
      }}
    />
  )
}
