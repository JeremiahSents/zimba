"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { cn } from "@workspace/ui/lib/utils"
import { useMemo, useState } from "react"
import { AdminSearchInput } from "@/components/admin-search-input"

export type AdminTableColumn<T> = {
  key: string
  label: string
  className?: string
  render: (row: T) => React.ReactNode
  searchableText?: (row: T) => string
}

export type AdminTableStatusFilter = {
  options: string[]
  getValue: (row: unknown) => string
}

interface AdminTableProps<T extends { id: string }> {
  columns: AdminTableColumn<T>[]
  rows: T[]
  searchPlaceholder?: string
  statusFilter?: AdminTableStatusFilter
  getRowHref?: (row: T) => string
  emptyMessage?: string
  className?: string
}

export function AdminTable<T extends { id: string }>({
  columns,
  rows,
  searchPlaceholder = "Search…",
  statusFilter,
  getRowHref,
  emptyMessage = "No results found.",
  className,
}: AdminTableProps<T>) {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<string>("all")

  const filtered = useMemo(() => {
    let result = rows
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((row) =>
        columns.some((col) =>
          col.searchableText?.(row).toLowerCase().includes(q)
        )
      )
    }
    if (statusFilter && status !== "all") {
      result = result.filter((row) => statusFilter.getValue(row) === status)
    }
    return result
  }, [rows, search, status, columns, statusFilter])

  const showFilters = columns.some((c) => c.searchableText) || statusFilter

  return (
    <div className={cn("space-y-4", className)}>
      {showFilters && (
        <div className="flex flex-wrap items-center gap-3">
          {columns.some((c) => c.searchableText) && (
            <AdminSearchInput
              value={search}
              onChange={setSearch}
              placeholder={searchPlaceholder}
            />
          )}
          {statusFilter && (
            <Select value={status} onValueChange={(v) => setStatus(v ?? "all")}>
              <SelectTrigger size="sm" className="w-40">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {statusFilter.options.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <span className="text-muted-foreground text-xs">
            {filtered.length} of {rows.length}
          </span>
        </div>
      )}

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key} className={col.className}>
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="py-12 text-center text-muted-foreground"
                >
                  {search || status !== "all"
                    ? "No results match your filters."
                    : emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((row) => {
                const href = getRowHref?.(row)
                return (
                  <TableRow
                    key={row.id}
                    className={href ? "cursor-pointer" : undefined}
                    onClick={
                      href ? () => (window.location.href = href) : undefined
                    }
                  >
                    {columns.map((col) => (
                      <TableCell key={col.key} className={col.className}>
                        {col.render(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
