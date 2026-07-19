"use client"

import {
  Download01Icon,
  PrinterIcon,
  Share08Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { markReceiptFullyPaidAction } from "@/app/admin/payments/actions"
import { useWorkspace } from "@/components/shared/workspace-context"
import { formatCurrency, formatShortDate } from "@/lib/format"
import { formatReceiptNumber } from "@/lib/receipt-number"
import type {
  ExpenseTableRow,
  PayableExpenseResponse,
  SupplierResponse,
} from "@/lib/types"

export function ReceiptModal({
  items,
  payable,
}: {
  items: ExpenseTableRow[]
  supplier?: SupplierResponse
  payable?: PayableExpenseResponse
}) {
  const router = useRouter()
  const workspace = useWorkspace()
  const first = items[0]!
  const total = items.reduce((sum, item) => sum + item.amount, 0)
  const paid = payable?.paid_amount ?? (first.status === "Full" ? total : 0)
  const outstanding = payable?.outstanding_amount ?? Math.max(total - paid, 0)
  const isPaid = outstanding === 0
  const [markingPaid, setMarkingPaid] = useState(false)

  const statusLabel =
    outstanding === 0 ? "Paid in full" : paid > 0 ? "Partially paid" : "Pending"
  const receiptNumber = formatReceiptNumber({
    fallbackId: payable?.id ?? first.id,
    organizationName: workspace.organizationName,
    receiptNumber: payable?.receipt_number,
  })

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      router.back()
    }
  }

  return (
    <Dialog open={true} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md gap-0 p-0 sm:max-w-lg">
        <div className="p-6 pb-0">
          <DialogHeader>
            <DialogTitle className="font-heading font-semibold text-xl">
              Receipt Details
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="grid gap-6 p-6">
          {/* Top Info Area */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-medium text-muted-foreground text-xs">
                Supplier
              </p>
              <div className="mt-2 flex items-center gap-2.5">
                <Avatar size="sm" className="size-6">
                  <AvatarFallback className="bg-primary/10 font-bold text-[10px] text-primary">
                    {first.supplier_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <p className="font-medium text-foreground text-sm">
                  {first.supplier_name}
                </p>
              </div>
            </div>
            <div>
              <p className="font-medium text-muted-foreground text-xs">
                Project
              </p>
              <p className="mt-2 font-medium text-foreground text-sm">
                {first.project_name}
              </p>
            </div>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium text-[10px] ${
                isPaid
                  ? "bg-green-50 text-green-700 ring-1 ring-green-600/20 ring-inset"
                  : "bg-orange-50 text-orange-700 ring-1 ring-orange-600/20 ring-inset"
              }`}
            >
              <span
                className={`size-1.5 rounded-full ${
                  isPaid ? "bg-green-500" : "bg-orange-500"
                }`}
              />
              {statusLabel}
            </span>
            <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 font-medium text-[10px] text-blue-700 ring-1 ring-blue-600/20 ring-inset">
              Project Expense
            </span>
          </div>

          {/* Items Inner Card */}
          <div className="rounded-2xl border bg-muted/20 p-5">
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-foreground text-sm">
                      {item.item_description}
                    </p>
                    <p className="mt-1 text-muted-foreground text-xs">
                      {formatShortDate(item.date)}
                    </p>
                  </div>
                  <p className="font-medium text-foreground text-sm tabular-nums">
                    {formatCurrency(item.amount)}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-end border-border border-t pt-4">
              <p className="font-medium text-primary text-sm">
                Total {formatCurrency(total)}
              </p>
            </div>
          </div>

          {/* Totals Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between font-medium text-muted-foreground text-sm">
              <span>Total Receipt Value</span>
              <span className="text-foreground tabular-nums">
                {formatCurrency(total)}
              </span>
            </div>
            <div className="flex items-center justify-between font-medium text-muted-foreground text-sm">
              <span>Amount Paid</span>
              <span className="text-foreground tabular-nums">
                - {formatCurrency(paid)}
              </span>
            </div>
            <div className="flex flex-col items-end pt-2">
              <span className="font-medium text-muted-foreground text-xs">
                Balance Due
              </span>
              <span
                className={`mt-1 font-bold font-heading text-3xl tabular-nums tracking-tight ${
                  outstanding > 0 ? "text-orange-600" : "text-emerald-600"
                }`}
              >
                {formatCurrency(outstanding)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 border-t p-4 sm:p-6 sm:pt-4">
          {payable && outstanding > 0 && (
            <Button
              disabled={markingPaid}
              onClick={async () => {
                setMarkingPaid(true)
                const result = await markReceiptFullyPaidAction(
                  payable.id,
                  payable.project_id,
                  crypto.randomUUID()
                )
                setMarkingPaid(false)
                if (result.success) router.refresh()
              }}
            >
              {markingPaid ? "Saving..." : "Mark fully paid"}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={async () => {
              const data = {
                title: `Receipt ${receiptNumber}`,
                text: `${first.supplier_name} - ${formatCurrency(total)}`,
                url: window.location.href,
              }
              if (navigator.share) await navigator.share(data)
              else await navigator.clipboard.writeText(window.location.href)
            }}
          >
            <HugeiconsIcon icon={Share08Icon} size={16} />
          </Button>
          {first.receipt_url && (
            <Button variant="outline" asChild>
              <a href={first.receipt_url} target="_blank" rel="noreferrer">
                <HugeiconsIcon icon={Download01Icon} size={16} />
              </a>
            </Button>
          )}
          <Button
            variant="secondary"
            className="gap-2"
            onClick={() => window.print()}
          >
            <HugeiconsIcon icon={PrinterIcon} size={16} />
            Export Receipt
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
