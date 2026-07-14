"use client"

import {
  ArrowUpRight01Icon,
  Search01Icon,
  Sorting05Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
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
import { useMemo, useState } from "react"
import { formatCurrency } from "@/lib/format"
import { getSupplierSlug, type SupplierListItem } from "@/lib/supplier-data"

export function SupplierTable({
  suppliers,
  filterLabel,
}: {
  suppliers: SupplierListItem[]
  filterLabel: string
}) {
  const [filter, setFilter] = useState("")
  const [sorting, setSorting] = useState<"name" | "amount" | "remaining">(
    "name"
  )
  const rows = useMemo(
    () =>
      suppliers
        .filter((supplier) =>
          supplier.name.toLowerCase().includes(filter.toLowerCase())
        )
        .sort((a, b) =>
          sorting === "name"
            ? a.name.localeCompare(b.name)
            : sorting === "amount"
              ? b.amount - a.amount
              : b.remaining - a.remaining
        ),
    [filter, sorting, suppliers]
  )
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
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder="Search suppliers..."
            className="pl-9"
          />
        </div>
        <span className="text-muted-foreground text-xs">
          {rows.length} suppliers · {filterLabel}
        </span>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <SortButton
                  label="Supplier"
                  active={sorting === "name"}
                  onClick={() => setSorting("name")}
                />
              </TableHead>
              <TableHead>Categories</TableHead>
              <TableHead>
                <SortButton
                  label="Receipt value"
                  active={sorting === "amount"}
                  onClick={() => setSorting("amount")}
                />
              </TableHead>
              <TableHead>Amount paid</TableHead>
              <TableHead>
                <SortButton
                  label="Remaining"
                  active={sorting === "remaining"}
                  onClick={() => setSorting("remaining")}
                />
              </TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((supplier) => {
              const paidPercent = supplier.amount
                ? Math.round((supplier.paid / supplier.amount) * 100)
                : 0
              const href = `/admin/suppliers/${getSupplierSlug(supplier.name)}`
              return (
                <TableRow
                  key={supplier.name}
                  tabIndex={0}
                  role="link"
                  aria-label={`Open ${supplier.name} details`}
                  className="group cursor-pointer hover:bg-muted/40"
                  onClick={() => {
                    window.location.href = href
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ")
                      window.location.href = href
                  }}
                >
                  <TableCell>
                    <div className="font-medium text-foreground">
                      {supplier.name}
                    </div>
                    <div className="mt-1 text-muted-foreground text-xs">
                      {supplier.payments} recorded payments
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex rounded-full border border-primary/40 bg-primary/5 px-2 py-1 font-medium text-primary text-xs capitalize">
                      {supplier.category}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {formatCurrency(supplier.amount)}
                    </div>
                    <div className="mt-1 text-muted-foreground text-xs">
                      {supplier.statusSummary.Full} full ·{" "}
                      {supplier.statusSummary.Partial} partial ·{" "}
                      {supplier.statusSummary["Not paid"]} unpaid
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {formatCurrency(supplier.paid)}
                    </div>
                    <div className="mt-2 h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${paidPercent}%` }}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-rose-700">
                      {formatCurrency(supplier.remaining)}
                    </div>
                    <div className="mt-1 text-muted-foreground text-xs">
                      {paidPercent}% settled
                    </div>
                  </TableCell>
                  <TableCell>
                    <HugeiconsIcon
                      icon={ArrowUpRight01Icon}
                      strokeWidth={1.8}
                      className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </TableCell>
                </TableRow>
              )
            })}
            {rows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-28 text-center text-muted-foreground"
                >
                  No suppliers match your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function SortButton({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <Button
      variant="ghost"
      size="xs"
      className="h-auto px-0 font-medium text-muted-foreground hover:bg-transparent hover:text-foreground"
      onClick={onClick}
    >
      {label}
      <HugeiconsIcon
        icon={Sorting05Icon}
        strokeWidth={1.5}
        className={`size-3.5 ${active ? "text-primary" : ""}`}
      />
    </Button>
  )
}
