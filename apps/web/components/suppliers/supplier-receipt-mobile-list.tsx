"use client"

import { formatCurrency, formatShortDate } from "@/lib/format"
import type {
  SupplierReceiptRow,
  SupplierReceiptStatus,
} from "@/lib/supplier-data"

const statusStyles: Record<SupplierReceiptStatus, string> = {
  New: "border-sky-200 bg-sky-50 text-sky-700",
  Pending: "border-rose-200 bg-rose-50 text-rose-700",
  Partial: "border-amber-200 bg-amber-50 text-amber-700",
  "Paid in full": "border-emerald-200 bg-emerald-50 text-emerald-700",
}

export function SupplierReceiptMobileList({
  receipts,
  slug,
}: {
  receipts: SupplierReceiptRow[]
  slug: string
}) {
  return receipts.length ? (
    <div className="flex flex-col gap-4">
      {receipts.map((receipt) => (
        <button
          key={receipt.id}
          type="button"
          className="grid gap-4 rounded-xl border bg-card p-5 text-left shadow-sm transition-colors hover:bg-muted/35"
          onClick={() => {
            window.location.href = `/${slug}/expenses/receipts/${receipt.id}`
          }}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-semibold text-foreground text-sm">
                {receipt.supplierName}
              </p>
              <p className="mt-1 truncate text-muted-foreground text-xs">
                {receipt.item} · {receipt.project}
              </p>
            </div>
            <span
              className={`inline-flex shrink-0 rounded-full border px-2.5 py-0.5 font-medium text-[10px] ${statusStyles[receipt.status]}`}
            >
              {receipt.status}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 border-t pt-4">
            {[
              ["Receipt", receipt.value],
              ["Paid", receipt.paid],
              ["Balance", receipt.remaining],
            ].map(([label, value]) => (
              <div key={label as string}>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  {label}
                </p>
                <p className="mt-1 font-medium text-foreground text-xs">
                  {formatCurrency(value as number)}
                </p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between border-t pt-3 text-[10px]">
            <div className="text-muted-foreground">Date & time</div>
            <div className="font-medium text-muted-foreground">
              {formatShortDate(receipt.date)} ·{" "}
              {new Date(receipt.createdAt).toLocaleTimeString("en-UG", {
                hour: "numeric",
                minute: "2-digit",
              })}
            </div>
          </div>
        </button>
      ))}
    </div>
  ) : (
    <div className="rounded-xl border border-dashed p-8 text-center">
      <p className="font-medium text-foreground text-sm">No receipts found</p>
      <p className="mt-1 text-muted-foreground text-xs">
        No receipts match your search.
      </p>
    </div>
  )
}
