"use client"

import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  type ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table"
import type {
  SupplierListItem,
  SupplierReceiptRow,
  SupplierReceiptStatus,
} from "@workspace/api"
import { DataTable } from "@workspace/ui/components/data-table"
import { useRouter } from "next/navigation"
import { type ReactNode, useMemo, useState } from "react"
import { SupplierReceiptStatusBadge } from "@/components/shared/status-badges"
import { useWorkspaceSlug } from "@/components/shared/use-workspace-slug"
import { SupplierReceiptMobileList } from "@/components/suppliers/supplier-receipt-mobile-list"
import { SupplierSummaryDialog } from "@/components/suppliers/supplier-summary-dialog"
import { formatCurrency, formatShortDate } from "@/lib/format"

export function SupplierTable({
  receipts,
  suppliers,
  title,
}: {
  receipts: SupplierReceiptRow[]
  suppliers: SupplierListItem[]
  title?: ReactNode
}) {
  const slug = useWorkspaceSlug()
  const router = useRouter()
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
              className="text-left"
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
        cell: ({ getValue }) => formatCurrency(getValue<number>()),
        meta: {          cellClassName: "tabular-nums whitespace-nowrap",
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => (
          <SupplierReceiptStatusBadge
            status={getValue<SupplierReceiptStatus>()}
          />
        ),
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
        ),      },
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
    <>
      <DataTable
        table={table}
        title={title}
        pagination="never"
        search={{
          value: globalFilter,
          onChange: setGlobalFilter,
          placeholder: "Search suppliers or receipts...",
          label: "Search suppliers or receipts",
        }}
        toolbar={
          <>
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as SupplierReceiptStatus | "all"
                )
              }
              aria-label="Filter by status"
              className="h-9 rounded-lg border bg-background px-3 text-sm"
            >
              <option value="all">All statuses</option>
              <option>New</option>
              <option>Pending</option>
              <option>Partial</option>
              <option>Paid in full</option>
            </select>
            <span className="text-muted-foreground text-xs">
              {rows.length} {rows.length === 1 ? "receipt" : "receipts"}
            </span>
          </>
        }
        emptyMessage="No receipts match your search."
        onRowClick={(row) =>
          router.push(`/${slug}/expenses/receipts/${row.original.id}`)
        }
        mobile={
          <SupplierReceiptMobileList
            receipts={rows.map((row) => row.original)}
            slug={slug}
          />
        }
      />
      <SupplierSummaryDialog
        supplier={selectedSupplier}
        open={Boolean(selectedSupplier)}
        onOpenChange={(open) => !open && setSelectedSupplier(undefined)}
      />
    </>
  )
}
