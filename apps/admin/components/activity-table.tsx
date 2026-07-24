"use client"

import { Search01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  Avatar,
  AvatarFallback,
} from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { useState } from "react"
import { formatCreatedDate } from "@/lib/format-currency"

export type ActivityItem = {
  id: string
  action: string
  entityType: string
  entityId: string
  changes: unknown
  createdAt: Date | string
  organizationName: string
  actorName: string
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

function getActionBadgeStyle(action: string) {
  const act = action.toLowerCase()
  if (act.includes("delete") || act.includes("remove") || act.includes("reject")) {
    return "bg-red-500/15 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-500/20"
  }
  if (act.includes("create") || act.includes("add") || act.includes("restore") || act.includes("approve")) {
    return "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-500/20"
  }
  if (act.includes("archive") || act.includes("update") || act.includes("edit")) {
    return "bg-blue-500/15 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-500/20"
  }
  return "bg-muted text-foreground border-border"
}

interface ActivityTableProps {
  data: ActivityItem[]
}

export function ActivityTable({ data }: ActivityTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState("")

  const columns: ColumnDef<ActivityItem>[] = [
    {
      accessorKey: "actorName",
      header: ({ column }) => (
        <button
          type="button"
          className="font-semibold text-xs text-foreground tracking-tight hover:text-primary transition-colors cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Actor
        </button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="size-8 border">
            <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
              {getInitials(row.original.actorName)}
            </AvatarFallback>
          </Avatar>
          <span className="font-semibold text-foreground text-sm">
            {row.original.actorName}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: ({ column }) => (
        <button
          type="button"
          className="font-semibold text-xs text-foreground tracking-tight hover:text-primary transition-colors cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Action
        </button>
      ),
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={`font-mono font-medium text-xs ${getActionBadgeStyle(
            row.original.action
          )}`}
        >
          {row.original.action}
        </Badge>
      ),
    },
    {
      accessorKey: "organizationName",
      header: ({ column }) => (
        <button
          type="button"
          className="font-semibold text-xs text-foreground tracking-tight hover:text-primary transition-colors cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Organization
        </button>
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground text-sm">
          {row.original.organizationName}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <button
          type="button"
          className="font-semibold text-xs text-foreground tracking-tight hover:text-primary transition-colors cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
        </button>
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground text-xs sm:text-sm">
          {formatCreatedDate(row.original.createdAt)}
        </span>
      ),
    },
  ]

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 15,
      },
    },
  })

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative min-w-48 max-w-sm flex-1">
          <HugeiconsIcon
            icon={Search01Icon}
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search activity by actor, action, or org…"
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="h-9 pl-9 rounded-xl"
          />
        </div>

        <div className="text-muted-foreground text-xs font-medium">
          Showing {table.getFilteredRowModel().rows.length} of {data.length} activity events
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
        <Table>
          <TableHeader className="bg-muted/30">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="py-2.5">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="transition-colors hover:bg-muted/40"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-muted-foreground"
                >
                  No activity logs found matching your criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
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
