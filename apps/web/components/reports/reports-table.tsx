"use client"

import { Download01Icon, Search01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Button } from "@workspace/ui/components/button"
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
import { exportProjectPdf } from "@/lib/export-pdf"
import { formatCurrency, formatPercent } from "@/lib/format"
import type { ProjectDashboardResponse } from "@/lib/types"

export function ReportsTable({
  projects,
}: {
  projects: ProjectDashboardResponse[]
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
            <span className="font-semibold text-foreground text-sm">
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
        cell: ({ getValue }) => (
          <span className="font-medium text-foreground text-sm tabular-nums">
            {formatCurrency(getValue<number>())}
          </span>
        ),
      },
      {
        accessorKey: "remaining",
        header: "Remaining",
        cell: ({ getValue }) => (
          <span className="font-medium text-foreground text-sm tabular-nums">
            {formatCurrency(getValue<number>())}
          </span>
        ),
      },
      {
        accessorKey: "pct",
        header: "Utilization",
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <Progress value={row.original.pct} className="w-24 h-2" />
            <span className="font-semibold text-xs text-foreground tabular-nums">
              {formatPercent(row.original.pct)}
            </span>
          </div>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right font-semibold text-xs">Action</div>,
        cell: ({ row }) => (
          <div className="text-right">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 rounded-lg px-2.5 hover:bg-primary/10 hover:text-primary transition-colors"
              onClick={() => exportProjectPdf(row.original)}
            >
              <HugeiconsIcon icon={Download01Icon} strokeWidth={1.7} className="size-3.5" />
              <span>Export PDF</span>
            </Button>
          </div>
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative min-w-48 max-w-sm flex-1">
          <HugeiconsIcon
            icon={Search01Icon}
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder="Search reports..."
            className="h-9 pl-9 rounded-xl max-w-sm"
          />
        </div>
        <div className="text-muted-foreground text-xs font-medium">
          Showing {table.getFilteredRowModel().rows.length} of {projects.length} project reports
        </div>
      </div>

      <ResponsiveDataView
        mobile={
          <div className="space-y-3">
            {table.getRowModel().rows.map((row) => {
              const project = row.original
              return (
                <MobileDataCard
                  key={row.id}
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
                  <div className="mt-4 pt-3 border-t flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 rounded-lg text-xs"
                      onClick={() => exportProjectPdf(project)}
                    >
                      <HugeiconsIcon icon={Download01Icon} strokeWidth={1.7} className="size-3.5" />
                      <span>Export PDF</span>
                    </Button>
                  </div>
                </MobileDataCard>
              )
            })}
          </div>
        }
        desktop={
          <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
            <Table>
              <TableHeader className="bg-muted/30">
                {table.getHeaderGroups().map((group) => (
                  <TableRow key={group.id}>
                    {group.headers.map((header) => (
                      <TableHead key={header.id} className="py-2.5">
                        {header.isPlaceholder ? null : (
                          <Button
                            variant="ghost"
                            size="xs"
                            className="px-0 font-semibold text-xs text-foreground tracking-tight hover:text-primary transition-colors cursor-pointer"
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </Button>
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="transition-colors hover:bg-muted/40">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3">
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
          </div>
        }
      />
      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-8 rounded-lg text-xs"
          >
            Previous
          </Button>
          <span className="text-muted-foreground text-xs font-medium px-2">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-8 rounded-lg text-xs"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
