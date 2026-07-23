"use client"

import {
  ArrowUpRight01Icon,
  Search01Icon,
  Sorting05Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { Input } from "@workspace/ui/components/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { useMemo, useState } from "react"
import { formatCurrency, formatShortDate } from "@/lib/format"
import type {
  SupplierListItem,
  SupplierReceiptRow,
  SupplierReceiptStatus,
} from "@/lib/supplier-data"

const statusStyles: Record<SupplierReceiptStatus, string> = {
  New: "border-sky-200 bg-sky-50 text-sky-700",
  Pending: "border-rose-200 bg-rose-50 text-rose-700",
  Partial: "border-amber-200 bg-amber-50 text-amber-700",
  "Paid in full": "border-emerald-200 bg-emerald-50 text-emerald-700",
}

export function SupplierTable({
  receipts,
  suppliers,
}: {
  receipts: SupplierReceiptRow[]
  suppliers: SupplierListItem[]
}) {
  const [globalFilter, setGlobalFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState<
    SupplierReceiptStatus | "all"
  >("all")
  const [sorting, setSorting] = useState<SortingState>([
    { id: "date", desc: true },
  ])
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierListItem>()
  const data = useMemo(
    () =>
      statusFilter === "all"
        ? receipts
        : receipts.filter((receipt) => receipt.status === statusFilter),
    [receipts, statusFilter]
  )
  const columns = useMemo<ColumnDef<SupplierReceiptRow>[]>(
    () => [
      {
        accessorKey: "supplierName",
        header: "Supplier",
        cell: ({ row }) => (
          <div>
            <button
              type="button"
              className="font-medium text-left hover:text-primary hover:underline"
              onClick={(event) => {
                event.stopPropagation()
                setSelectedSupplier(
                  suppliers.find((supplier) =>
                    supplier.id
                      ? supplier.id === row.original.supplierId
                      : supplier.name === row.original.supplierName
                  )
                )
              }}
            >
              {row.original.supplierName}
            </button>
            <p className="mt-1 text-muted-foreground text-xs">
              {row.original.item} · {row.original.project}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "value",
        header: "Receipt value",
        cell: ({ getValue }) => (
          <span className="font-semibold tabular-nums">
            {formatCurrency(getValue<number>())}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => {
          const status = getValue<SupplierReceiptStatus>()
          return (
            <span
              className={`inline-flex rounded-full border px-2.5 py-1 font-medium text-xs ${statusStyles[status]}`}
            >
              {status}
            </span>
          )
        },
      },
      {
        accessorKey: "date",
        header: "Date & time",
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{formatShortDate(row.original.date)}</p>
            <p className="mt-1 text-muted-foreground text-xs">
              {new Date(row.original.createdAt).toLocaleTimeString("en-UG", {
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          </div>
        ),
      },
      {
        id: "open",
        header: "",
        enableSorting: false,
        cell: () => (
          <HugeiconsIcon
            icon={ArrowUpRight01Icon}
            strokeWidth={1.8}
            className="size-4 text-muted-foreground"
          />
        ),
      },
    ],
    [suppliers]
  )
  const table = useReactTable({
    data,
    columns,
    state: { globalFilter, sorting },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })
  const rows = table.getRowModel().rows
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <HugeiconsIcon
            icon={Search01Icon}
            strokeWidth={1.8}
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
            placeholder="Search suppliers or receipts..."
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value as SupplierReceiptStatus | "all"
              )
            }
            className="h-9 rounded-lg border bg-background px-3 text-sm"
          >
            <option value="all">All statuses</option>
            <option>New</option>
            <option>Pending</option>
            <option>Partial</option>
            <option>Paid in full</option>
          </select>
          <span className="text-muted-foreground text-xs">
            {rows.length} receipts
          </span>
        </div>
      </div>
      <div className="md:hidden">
        <div className="flex flex-col gap-4">
          {rows.length ? (
            rows.map((row) => (
              <button
                key={row.id}
                type="button"
                className="grid gap-4 rounded-xl border bg-card p-5 text-left shadow-sm transition-colors hover:bg-muted/35"
                onClick={() => {
                  window.location.href = `/admin/expenses/receipts/${row.original.id}`
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-sm text-foreground">
                      {row.original.supplierName}
                    </p>
                    <p className="mt-1 truncate text-muted-foreground text-xs">
                      {row.original.item} · {row.original.project}
                    </p>
                  </div>
                  <span
                    className={`inline-flex shrink-0 rounded-full border px-2.5 py-0.5 font-medium text-[10px] ${statusStyles[row.original.status]}`}
                  >
                    {row.original.status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 border-t pt-4">
                  <div>
                    <p className="text-muted-foreground text-[10px] uppercase tracking-wider">
                      Receipt
                    </p>
                    <p className="mt-1 font-medium text-xs text-foreground">
                      {formatCurrency(row.original.value)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[10px] uppercase tracking-wider">
                      Paid
                    </p>
                    <p className="mt-1 font-medium text-xs text-foreground">
                      {formatCurrency(row.original.paid)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[10px] uppercase tracking-wider">
                      Balance
                    </p>
                    <p className="mt-1 font-medium text-xs text-foreground">
                      {formatCurrency(row.original.remaining)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t pt-3 text-[10px]">
                  <div className="text-muted-foreground">Date & time</div>
                  <div className="font-medium text-muted-foreground">
                    {formatShortDate(row.original.date)} ·{" "}
                    {new Date(row.original.createdAt).toLocaleTimeString(
                      "en-UG",
                      { hour: "numeric", minute: "2-digit" }
                    )}
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="rounded-xl border border-dashed p-8 text-center">
              <p className="font-medium text-sm text-foreground">
                No receipts found
              </p>
              <p className="mt-1 text-muted-foreground text-xs">
                No receipts match your search.
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="hidden overflow-x-auto rounded-2xl border md:block">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => (
                  <TableHead key={header.id}>
                    <button
                      type="button"
                      className="inline-flex items-center text-muted-foreground"
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
                          className="ml-1 size-3.5"
                        />
                      )}
                    </button>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length ? (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="group cursor-pointer hover:bg-muted/40"
                  onClick={() => {
                    window.location.href = `/admin/expenses/receipts/${row.original.id}`
                  }}
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ")
                      window.location.href = `/admin/expenses/receipts/${row.original.id}`
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
                  className="h-28 text-center text-muted-foreground"
                >
                  No receipts match your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <Dialog
        open={Boolean(selectedSupplier)}
        onOpenChange={(open) => !open && setSelectedSupplier(undefined)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedSupplier?.name}</DialogTitle>
            <DialogDescription>Supplier account summary</DialogDescription>
          </DialogHeader>
          {selectedSupplier && (
            <div className="grid grid-cols-3 gap-3 rounded-xl border bg-muted/25 p-4">
              <Metric
                label="Receipt total"
                value={formatCurrency(selectedSupplier.amount)}
              />
              <Metric
                label="Paid"
                value={formatCurrency(selectedSupplier.paid)}
              />
              <Metric
                label="Balance"
                value={formatCurrency(selectedSupplier.remaining)}
              />
            </div>
          )}
          {selectedSupplier && (
            <dl className="grid gap-3 text-sm">
              <Contact label="Phone" value={selectedSupplier.phone} />
              <Contact label="Email" value={selectedSupplier.email} />
              <Contact
                label="Contact"
                value={
                  selectedSupplier.contactName ??
                  selectedSupplier.companyContact
                }
              />
            </dl>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted-foreground text-[10px] uppercase tracking-wider">
        {label}
      </dt>
      <dd className="mt-1 font-semibold text-sm tabular-nums">{value}</dd>
    </div>
  )
}

function Contact({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="truncate font-medium">{value || "Not provided"}</dd>
    </div>
  )
}
