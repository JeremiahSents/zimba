"use client"

import {
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowUp01Icon,
  Search01Icon,
  Sorting05Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  flexRender,
  type Row,
  type Table as TanstackTable,
} from "@tanstack/react-table"
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
import { cn } from "@workspace/ui/lib/utils"
import type { ReactNode } from "react"

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> {
    /** Horizontal alignment applied to both the header and its cells. */
    align?: "left" | "right" | "center"
    headerClassName?: string
    cellClassName?: string
  }
}

const alignClassName = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} as const

export type DataTableSearch = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  /** Accessible name for the input. Defaults to the placeholder. */
  label?: string
}

export type DataTableProps<TData> = {
  table: TanstackTable<TData>
  /** Card heading, shown at the left of the toolbar. */
  title?: ReactNode
  search?: DataTableSearch
  /** Extra toolbar controls (selects, filter buttons) placed after the search. */
  toolbar?: ReactNode
  emptyMessage?: string
  /**
   * Renders one card per row below `md`. When omitted the table itself is shown
   * at every width and scrolls horizontally instead.
   */
  renderMobileRow?: (row: Row<TData>) => ReactNode
  /**
   * Replaces the whole sub-`md` view, for cases that aren't a card per row.
   * Takes precedence over `renderMobileRow`.
   */
  mobile?: ReactNode
  /** Makes rows clickable, with matching keyboard activation. */
  onRowClick?: (row: Row<TData>) => void
  /** Replaces the page counter at the left of the footer. */
  footerNote?: ReactNode
  /** `auto` (default) hides the footer entirely while everything fits one page. */
  pagination?: "auto" | "always" | "never"
  className?: string
  /**
   * Applied to the `<table>` itself — for `table-fixed` layouts and minimum
   * widths. Per-column widths go on `meta.headerClassName`.
   */
  tableClassName?: string
}

export function DataTable<TData>({
  table,
  title,
  search,
  toolbar,
  emptyMessage = "No results found.",
  renderMobileRow,
  mobile,
  onRowClick,
  footerNote,
  pagination = "auto",
  className,
  tableClassName,
}: DataTableProps<TData>) {
  const rows = table.getRowModel().rows
  const columnCount = table.getAllLeafColumns().length
  const pageCount = Math.max(table.getPageCount(), 1)

  const hasMobileCards = Boolean(renderMobileRow || mobile)
  const hasToolbar = Boolean(title || search || toolbar)
  const showPagination =
    pagination === "always" || (pagination === "auto" && pageCount > 1)

  // Below `md` the mobile cards carry their own borders, so the card shell —
  // and the padding that goes with it — is suppressed there to avoid nesting
  // one card inside another.
  const shell = hasMobileCards
    ? "md:overflow-hidden md:rounded-2xl md:border md:bg-card md:shadow-[0_10px_30px_-26px_rgba(15,23,42,0.7)]"
    : "overflow-hidden rounded-2xl border bg-card shadow-[0_10px_30px_-26px_rgba(15,23,42,0.7)]"
  const toolbarSpacing = hasMobileCards
    ? "pb-3 md:border-b md:px-6 md:py-4"
    : "border-b px-5 py-4 md:px-6"
  const footerSpacing = hasMobileCards
    ? "pt-3 md:border-t md:px-6 md:py-3.5"
    : "border-t px-5 py-3.5 md:px-6"

  return (
    <section className={cn("flex flex-col", shell, className)}>
      {hasToolbar ? (
        <div
          className={cn(
            "flex flex-col gap-3 sm:flex-row sm:items-center",
            title ? "sm:justify-between" : "sm:justify-end",
            toolbarSpacing
          )}
        >
          {title ? (
            <h2 className="font-heading font-medium text-base text-foreground leading-6 tracking-tight">
              {title}
            </h2>
          ) : null}
          {search || toolbar ? (
            <div className="flex flex-wrap items-center gap-2">
              {search ? (
                <div className="relative min-w-0 flex-1 sm:w-56 sm:flex-none">
                  <HugeiconsIcon
                    icon={Search01Icon}
                    strokeWidth={1.5}
                    className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    value={search.value}
                    onChange={(event) => search.onChange(event.target.value)}
                    placeholder={search.placeholder ?? "Search"}
                    aria-label={search.label ?? search.placeholder ?? "Search"}
                    className="border-border bg-background pl-9"
                  />
                </div>
              ) : null}
              {toolbar}
            </div>
          ) : null}
        </div>
      ) : null}

      {mobile ? (
        <div className="md:hidden">{mobile}</div>
      ) : renderMobileRow ? (
        <div className="space-y-3 md:hidden">
          {rows.length > 0 ? (
            rows.map((row) => <div key={row.id}>{renderMobileRow(row)}</div>)
          ) : (
            <div className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground text-sm">
              {emptyMessage}
            </div>
          )}
        </div>
      ) : null}

      <div className={hasMobileCards ? "hidden md:block" : undefined}>
        <Table className={tableClassName}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta
                  const align = meta?.align ?? "left"
                  const sorted = header.column.getIsSorted()

                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        alignClassName[align],
                        meta?.headerClassName
                      )}
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          data-sorted={sorted ? "true" : "false"}
                          aria-label={`Sort by ${header.column.id}`}
                          className={cn(
                            "group/sort -mx-1 inline-flex items-center gap-1.5 rounded px-1 py-0.5 outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/45 data-[sorted=true]:text-foreground",
                            align === "right" && "flex-row-reverse"
                          )}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          <HugeiconsIcon
                            icon={
                              sorted === "asc"
                                ? ArrowUp01Icon
                                : sorted === "desc"
                                  ? ArrowDown01Icon
                                  : Sorting05Icon
                            }
                            strokeWidth={1.8}
                            className="size-3.5 opacity-0 transition-opacity group-hover/sort:opacity-60 group-focus-visible/sort:opacity-60 group-data-[sorted=true]/sort:opacity-100"
                          />
                        </button>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  className={onRowClick ? "cursor-pointer" : undefined}
                  tabIndex={onRowClick ? 0 : undefined}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  onKeyDown={
                    onRowClick
                      ? (event) => {
                          if (event.key !== "Enter" && event.key !== " ") return
                          event.preventDefault()
                          onRowClick(row)
                        }
                      : undefined
                  }
                >
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta
                    return (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          alignClassName[meta?.align ?? "left"],
                          meta?.cellClassName
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={columnCount}
                  className="h-28 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {showPagination ? (
        <div
          className={cn(
            "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
            footerSpacing
          )}
        >
          <p className="text-muted-foreground text-xs">
            {footerNote ?? (
              <>
                Page {table.getState().pagination.pageIndex + 1} of {pageCount}
              </>
            )}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={1.5} />
              Previous
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
              <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={1.5} />
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  )
}
