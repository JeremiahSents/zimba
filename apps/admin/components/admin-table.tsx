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

export type AdminTableColumn = {
  key: string
  label: string
  className?: string
}

export type AdminTableRow = {
  id: string
  href?: string
  searchText?: string
  status?: string
  cells: Record<string, React.ReactNode>
}

export type AdminTableStatusFilter = {
  options: string[]
}

interface AdminTableProps {
  columns: AdminTableColumn[]
  rows: AdminTableRow[]
  searchPlaceholder?: string
  statusFilter?: AdminTableStatusFilter
  emptyMessage?: string
  className?: string
}

export function AdminTable({
  columns,
  rows,
  searchPlaceholder = "Search…",
  statusFilter,
  emptyMessage = "No results found.",
  className,
}: AdminTableProps) {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<string>("all")

  const filtered = useMemo(() => {
    let result = rows
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((row) => row.searchText?.toLowerCase().includes(q))
    }
    if (statusFilter && status !== "all") {
      result = result.filter((row) => row.status === status)
    }
    return result
  }, [rows, search, status, statusFilter])

  const hasSearch = rows.some((row) => row.searchText)
  const showFilters = hasSearch || statusFilter

  return (
    <div className={cn("space-y-4", className)}>
      {showFilters && (
        <div className="flex flex-wrap items-center gap-3">
          {hasSearch && (
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
                return (
                  <TableRow
                    key={row.id}
                    className={row.href ? "cursor-pointer" : undefined}
                    onClick={
                      row.href ? () => (window.location.href = row.href as string) : undefined
                    }
                  >
                    {columns.map((col) => (
                      <TableCell key={col.key} className={col.className}>
                        {row.cells[col.key] ?? null}
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
