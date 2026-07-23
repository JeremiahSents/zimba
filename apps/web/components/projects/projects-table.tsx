"use client"

import { Sorting05Icon } from "@hugeicons/core-free-icons"
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
import { Progress } from "@workspace/ui/components/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import Link from "next/link"
import { useMemo, useState } from "react"
import { useWorkspaceSlug } from "@/components/shared/use-workspace-slug"
import { formatCurrency, formatPercent } from "@/lib/format"
import type { ProjectDashboardResponse } from "@/lib/types"

type Details = Record<
  string,
  { client: string; timeline: string; status: "On track" | "At risk" }
>

export function ProjectsTable({
  projects,
  details,
}: {
  projects: ProjectDashboardResponse[]
  details: Details
}) {
  const slug = useWorkspaceSlug()
  const [filter, setFilter] = useState("")
  const [sorting, setSorting] = useState<SortingState>([])
  const columns = useMemo<ColumnDef<ProjectDashboardResponse>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Project",
        cell: ({ row }) => (
          <div>
            <Link
              href={`/${slug}/projects/${row.original.id}`}
              className="font-medium hover:text-primary hover:underline"
            >
              {row.original.name}
            </Link>
            <p className="text-muted-foreground text-xs">
              {row.original.location}
            </p>
          </div>
        ),
      },
      {
        id: "client",
        header: "Client",
        accessorFn: (row) => details[row.id]?.client ?? "Private client",
      },
      {
        id: "status",
        header: "Status",
        accessorFn: (row) => details[row.id]?.status ?? "On track",
        cell: ({ row }) => (
          <span
            className={
              details[row.original.id]?.status === "At risk"
                ? "inline-flex rounded-lg bg-red-50 px-1.5 py-0.5 font-medium text-[10px] text-red-600"
                : "inline-flex rounded-lg bg-green-50 px-1.5 py-0.5 font-medium text-[10px] text-green-600"
            }
          >
            {details[row.original.id]?.status ?? "On track"}
          </span>
        ),
      },
      {
        id: "timeline",
        header: "Timeline",
        accessorFn: (row) => details[row.id]?.timeline ?? "Timeline pending",
      },
      {
        accessorKey: "budget",
        header: "Budget",
        cell: ({ getValue }) => formatCurrency(getValue<number>()),
      },
      {
        accessorKey: "pct",
        header: "Spend",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Progress
              value={Math.max(100 - row.original.pct, 0)}
              className={`w-20 [&_[data-slot=progress-indicator]]:ml-auto ${
                row.original.pct >= 80
                  ? "[&_[data-slot=progress-indicator]]:bg-red-500"
                  : row.original.pct >= 60
                    ? "[&_[data-slot=progress-indicator]]:bg-amber-500"
                    : "[&_[data-slot=progress-indicator]]:bg-green-500"
              }`}
            />
            <span
              className={`rounded-lg px-1.5 py-0.5 font-medium text-[10px] ${
                row.original.pct >= 80
                  ? "bg-red-50 text-red-600"
                  : row.original.pct >= 60
                    ? "bg-amber-50 text-amber-600"
                    : "bg-green-50 text-green-600"
              }`}
            >
              {formatPercent(row.original.pct)}
            </span>
          </div>
        ),
      },
    ],
    [details, slug]
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
    initialState: { pagination: { pageSize: 5 } },
  })
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Input
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          placeholder="Search projects..."
          className="max-w-xs"
        />
        <span className="text-muted-foreground text-xs">
          {table.getFilteredRowModel().rows.length} projects
        </span>
      </div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id}>
              {group.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={header.id === "name" ? undefined : "border-l"}
                >
                  <Button
                    variant="ghost"
                    size="xs"
                    className="px-0 text-inherit"
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
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className={cell.column.id === "name" ? undefined : "border-l"}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between border-t pt-3">
        <span className="text-muted-foreground text-xs">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {Math.max(table.getPageCount(), 1)}
        </span>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
