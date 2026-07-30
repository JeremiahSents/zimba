"use client"

import type { AdminBudgetItemReceiptDto } from "@workspace/api"
import {
  ArrowUpRight01Icon,
  Calendar03Icon,
  File02Icon,
  Image02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Card } from "@workspace/ui/components/card"
import { StatusBadge } from "@/components/status-badge"
import { formatCompactCurrency } from "@/lib/format-currency"

function formatShortDate(dateInput: Date | string) {
  return new Date(dateInput).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function toTitleCase(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, " ")
    .replace(/\b\p{L}/gu, (match) => match.toUpperCase())
}

export function BudgetItemReceiptCards({
  receipts,
  currency,
}: {
  receipts: AdminBudgetItemReceiptDto[]
  currency: string
}) {
  if (receipts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground text-sm">
        No receipts charged to this budget item yet.
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {receipts.map((receipt) => {
        const isImage = receipt.receiptContentType?.startsWith("image/")
        const hasFile = Boolean(receipt.receiptFileUrl)
        const remaining = receipt.totalCents - receipt.paidCents
        const cardInner = (
          <Card className="gap-0 p-5 shadow-sm transition hover:border-primary/35 hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate font-heading font-semibold text-base">
                  {receipt.supplierName
                    ? toTitleCase(receipt.supplierName)
                    : "Unknown supplier"}
                </h3>
                <p className="mt-1 flex items-center gap-1.5 text-muted-foreground text-xs">
                  <HugeiconsIcon
                    icon={Calendar03Icon}
                    strokeWidth={1.6}
                    className="size-3.5"
                  />
                  {formatShortDate(receipt.expenseDate ?? receipt.createdAt)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <StatusBadge status={receipt.status} />
                {hasFile ? (
                  <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <HugeiconsIcon
                      icon={isImage ? Image02Icon : File02Icon}
                      strokeWidth={1.7}
                      className="size-3.5"
                    />
                  </span>
                ) : null}
              </div>
            </div>
            <dl className="mt-5 grid grid-cols-3 gap-2 border-y py-4">
              <Metric
                label="Total"
                value={formatCompactCurrency(receipt.totalCents, currency)}
              />
              <Metric
                label="Paid"
                value={formatCompactCurrency(receipt.paidCents, currency)}
              />
              <Metric
                label="Balance"
                value={formatCompactCurrency(remaining, currency)}
              />
            </dl>
            <div className="mt-4 flex items-center justify-between text-muted-foreground text-xs">
              <span>
                {receipt.itemCount} {receipt.itemCount === 1 ? "item" : "items"}
              </span>
              {hasFile ? (
                <span className="inline-flex items-center gap-1 font-medium text-primary">
                  Open receipt
                  <HugeiconsIcon
                    icon={ArrowUpRight01Icon}
                    strokeWidth={1.8}
                    className="size-3.5"
                  />
                </span>
              ) : (
                <span>No file attached</span>
              )}
            </div>
          </Card>
        )

        if (hasFile) {
          return (
            <a
              key={receipt.id}
              href={receipt.receiptFileUrl ?? "#"}
              target="_blank"
              rel="noreferrer"
              className="outline-none focus-visible:ring-2 focus-visible:ring-ring/45 rounded-2xl"
            >
              {cardInner}
            </a>
          )
        }
        return <div key={receipt.id}>{cardInner}</div>
      })}
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] text-muted-foreground uppercase tracking-wide">
        {label}
      </dt>
      <dd className="mt-1 truncate font-semibold text-xs tabular-nums">
        {value}
      </dd>
    </div>
  )
}
