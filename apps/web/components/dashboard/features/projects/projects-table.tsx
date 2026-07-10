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
import { Sorting05Icon } from "@hugeicons/core-free-icons"

import { Badge } from "@workspace/ui/components/badge"
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
import { formatCurrency, formatPercent } from "@/lib/zimba/format"
import type { ProjectDashboardResponse } from "@/lib/zimba/types"

type Details = Record<
  number,
  { client: string; timeline: string; status: "On track" | "At risk" }
>

export function ProjectsTable({
  projects,
  details,
}: {
  projects: ProjectDashboardResponse[]
  details: Details
}) {
  const [filter, setFilter] = useState("")
  const [sorting, setSorting] = useState<SortingState>([])
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
        id: "client",
        header: "Client",
        accessorFn: (row) => details[row.id]?.client ?? "Private client",
      },
      {
        id: "status",
        header: "Status",
        accessorFn: (row) => details[row.id]?.status ?? "On track",
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={
              details[row.original.id]?.status === "At risk"
                ? "bg-warning-soft text-warning"
                : "bg-success-soft text-success"
            }
          >
            {details[row.original.id]?.status ?? "On track"}
          </Badge>
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
            <Progress value={row.original.pct} className="w-20" />
            <span className="text-xs font-medium">
              {formatPercent(row.original.pct)}
            </span>
          </div>
        ),
      },
    ],
    [details]
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
        <span className="text-xs text-muted-foreground">
          {table.getFilteredRowModel().rows.length} projects
        </span>
      </div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id}>
              {group.headers.map((header) => (
                <TableHead key={header.id}>
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
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between border-t pt-3">
        <span className="text-xs text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {Math.max(table.getPageCount(), 1)}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
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
