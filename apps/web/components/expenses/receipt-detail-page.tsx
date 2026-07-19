"use client"

import {
  ArrowLeft01Icon,
  Call02Icon,
  Download01Icon,
  Mail01Icon,
  MapsLocation01Icon,
  PrinterIcon,
  Share08Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import { Button } from "@workspace/ui/components/button"
import { Progress } from "@workspace/ui/components/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ErrorNotice } from "@/components/shared/error-notice"
import type { PublicError } from "@/core/shared/errors"
import { markReceiptFullyPaidAction, recordReceiptPaymentAction } from "@/app/admin/payments/actions"
import { DashboardShell } from "@/components/shared/dashboard-shell"
import { DatePicker } from "@/components/shared/date-picker"
import { formatCurrency, formatShortDate } from "@/lib/format"
import type {
  ExpenseTableRow,
  PayableExpenseResponse,
  SupplierResponse,
} from "@/lib/types"

export function ReceiptDetailPage({
  items,
  supplier,
  payable,
}: {
  items: ExpenseTableRow[]
  supplier?: SupplierResponse
  payable?: PayableExpenseResponse
}) {
  const router = useRouter()
  const first = items[0]!
  const total = items.reduce((sum, item) => sum + item.amount, 0)
  const paid = payable?.paid_amount ?? (first.status === "Full" ? total : 0)
  const outstanding = payable?.outstanding_amount ?? Math.max(total - paid, 0)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [amount, setAmount] = useState(String(outstanding))
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().slice(0, 10)
  )
  const [method, setMethod] = useState("cash")
  const [reference, setReference] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<PublicError | string>("")
  const [markingPaid, setMarkingPaid] = useState(false)
  const paidPercent = total > 0 ? Math.min(Math.round((paid / total) * 100), 100) : 0
  const statusLabel =
    outstanding === 0 ? "Paid in full" : paid > 0 ? "Partially paid" : "Not paid"
  const statusClasses =
    outstanding === 0
      ? "bg-green-50 text-green-700 ring-green-600/20"
      : paid > 0
        ? "bg-amber-50 text-amber-700 ring-amber-600/20"
        : "bg-slate-50 text-slate-700 ring-slate-600/20"

  return (
    <DashboardShell
      title="Receipt Details"
      subtitle="Review the items recorded on this receipt."
    >
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center print:hidden">
        <Link
          href="/admin/projects"
          className="inline-flex w-fit items-center gap-2 rounded-lg font-medium text-muted-foreground text-sm transition-colors hover:text-foreground"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} /> Back to projects
        </Link>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Button variant="outline" onClick={() => window.print()} className="gap-2">
            <HugeiconsIcon icon={PrinterIcon} size={16} />
            <span>Print</span>
          </Button>
          <Button variant="outline" onClick={async () => {
            const data = { title: `Receipt ${payable?.receipt_number ?? first.id}`, text: `${first.supplier_name} · ${formatCurrency(total)}`, url: window.location.href }
            if (navigator.share) await navigator.share(data)
            else await navigator.clipboard.writeText(window.location.href)
          }} className="gap-2">
            <HugeiconsIcon icon={Share08Icon} size={16} />
            <span>Share</span>
          </Button>
          {first.receipt_url && (
            <Button variant="secondary" asChild className="gap-2">
              <a href={first.receipt_url} target="_blank" rel="noreferrer">
                <HugeiconsIcon icon={Download01Icon} size={16} />
                <span>View Original</span>
              </a>
            </Button>
          )}
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl items-start gap-6 lg:grid-cols-[1fr_380px]">
        {/* Receipt Paper Card */}
        <div className="receipt-print-area overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 sm:p-8 lg:p-12">
            {/* Header */}
            <div className="mb-8 flex flex-col items-start justify-between gap-6 border-b pb-8 md:flex-row md:items-center">
              <div className="flex items-center gap-4">
                <Avatar size="lg" className="size-14 ring-1 ring-border">
                  <AvatarFallback className="bg-primary/10 font-bold font-heading text-primary text-xl">
                    {first.supplier_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="font-heading font-bold text-2xl text-foreground tracking-tight">
                    {first.supplier_name}
                  </h1>
                  <p className="mt-1 font-medium text-muted-foreground text-sm">
                    {first.project_name} · Project Expense
                  </p>
                </div>
              </div>
              <div className="text-left md:text-right">
                <h2 className="font-heading font-bold text-xl text-foreground uppercase tracking-widest">
                  Receipt
                </h2>
                <div className="mt-2 space-y-1 font-medium text-muted-foreground text-sm">
                  <p>
                    No: {payable?.receipt_number ?? `RCPT-${first.id.toString().padStart(4, "0")}`}
                  </p>
                  <p>Date: {formatShortDate(first.date)}</p>
                </div>
              </div>
            </div>

            {/* Addresses */}
            <div className="mb-10 grid gap-8 md:grid-cols-2 border-b pb-8">
              <div className="space-y-4">
                <p className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                  From
                </p>
                <div>
                  <h3 className="font-heading font-semibold text-foreground text-lg">
                    {first.supplier_name}
                  </h3>
                  <div className="mt-3 space-y-2 text-muted-foreground text-sm">
                    {supplier?.phone && <p className="flex items-center gap-2"><HugeiconsIcon icon={Call02Icon} className="size-4 shrink-0"/> {supplier.phone}</p>}
                    {supplier?.email && <p className="flex items-center gap-2"><HugeiconsIcon icon={Mail01Icon} className="size-4 shrink-0"/> {supplier.email}</p>}
                    {supplier?.companyContact && <p className="flex items-center gap-2"><HugeiconsIcon icon={MapsLocation01Icon} className="size-4 shrink-0"/> {supplier.companyContact}</p>}
                    {!supplier?.phone && !supplier?.email && !supplier?.companyContact && (
                      <p>Supplier details unavailable</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <p className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                  Billed To
                </p>
                <div className="space-y-2 text-sm">
                  <h3 className="font-heading font-semibold text-foreground text-lg">
                    Zimba Consultants
                  </h3>
                  <p className="flex items-center gap-2 text-muted-foreground"><HugeiconsIcon icon={MapsLocation01Icon} className="size-4 shrink-0"/> {first.project_name}</p>
                </div>
              </div>
            </div>

            {/* Items List */}
            <div className="mb-8">
              <div className="hidden grid-cols-[3rem_1fr_8rem_5rem_8rem] gap-4 border-b pb-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider md:grid">
                <div className="text-center">No</div>
                <div>Item Description</div>
                <div className="text-right">Price</div>
                <div className="text-center">Qty</div>
                <div className="text-right">Total</div>
              </div>
              <div className="divide-y divide-border">
                {items.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-1 gap-4 py-5 md:grid-cols-[3rem_1fr_8rem_5rem_8rem] md:items-center">
                    {/* Mobile View */}
                    <div className="flex items-start justify-between md:hidden">
                      <div>
                        <p className="font-semibold text-foreground">{item.item_description}</p>
                        <p className="mt-1 text-muted-foreground text-xs">{item.task_name}</p>
                        <p className="mt-3 font-medium text-muted-foreground text-xs">
                          {item.quantity ?? 1} × {formatCurrency(item.unit_rate ?? item.amount)}
                        </p>
                      </div>
                      <p className="font-semibold text-foreground tabular-nums">{formatCurrency(item.amount)}</p>
                    </div>

                    {/* Desktop View */}
                    <div className="hidden text-center text-muted-foreground text-sm md:block">{index + 1}.</div>
                    <div className="hidden md:block">
                      <p className="font-medium text-foreground">{item.item_description}</p>
                      <p className="mt-1 text-muted-foreground text-xs">{item.task_name}</p>
                    </div>
                    <div className="hidden text-right text-muted-foreground text-sm tabular-nums md:block">
                      {formatCurrency(item.unit_rate ?? item.amount)}
                    </div>
                    <div className="hidden text-center text-muted-foreground text-sm md:block">
                      {item.quantity ?? 1}
                    </div>
                    <div className="hidden text-right font-semibold text-foreground tabular-nums md:block">
                      {formatCurrency(item.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals Section */}
            <div className="flex justify-end border-t pt-6">
              <div className="w-full space-y-4 md:w-80">
                <div className="flex justify-between font-medium text-muted-foreground text-sm">
                  <span>Subtotal</span>
                  <span className="text-foreground tabular-nums">
                    {formatCurrency(total)}
                  </span>
                </div>
                <div className="flex justify-between font-medium text-muted-foreground text-sm">
                  <span>Tax</span>
                  <span className="text-foreground tabular-nums">
                    {formatCurrency(0)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-foreground border-t-2 pt-4">
                  <span className="font-heading font-semibold text-foreground text-lg uppercase tracking-wider">
                    Total
                  </span>
                  <span className="font-heading font-bold text-foreground text-2xl tabular-nums tracking-tight">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Sidebar */}
        <div className="space-y-6 print:hidden">
          <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                Outstanding
              </p>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 font-semibold text-[10px] uppercase tracking-wider ring-1 ring-inset ${statusClasses}`}
              >
                {statusLabel}
              </span>
            </div>
            <p className="mt-4 font-heading font-bold text-4xl text-foreground tabular-nums tracking-tighter">
              {formatCurrency(outstanding)}
            </p>
            <div className="mt-6">
              <div className="mb-2 flex justify-between font-medium text-xs">
                <span className="text-muted-foreground">Amount Paid</span>
                <span className="text-foreground">{paidPercent}%</span>
              </div>
              <Progress value={paidPercent} className="h-2" />
              <p className="mt-3 font-medium text-muted-foreground text-xs">
                <span className="text-foreground">{formatCurrency(paid)}</span> of {formatCurrency(total)} settled
              </p>
            </div>
            {payable && outstanding > 0 && (
              <div className="mt-8 grid gap-3">
                <Button
                  className="w-full font-semibold"
                  disabled={markingPaid}
                  size="lg"
                  onClick={async () => {
                    setMarkingPaid(true)
                    const result = await markReceiptFullyPaidAction(
                      payable.id,
                      payable.project_id,
                      crypto.randomUUID()
                    )
                    setMarkingPaid(false)
                    if (!result.success) return setError(result.error)
                    router.refresh()
                  }}
                >
                  {markingPaid ? "Processing..." : "Mark fully paid"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  size="lg"
                  onClick={() => setPaymentOpen(true)}
                >
                  Record partial payment
                </Button>
              </div>
            )}
            {error && !paymentOpen && (
              <div className="mt-4">
                <ErrorNotice error={error} />
              </div>
            )}
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
            <p className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
              Payment history
            </p>
            {payable?.payments.length ? (
              <ol className="mt-6 space-y-5">
                {payable.payments.map((payment, idx) => (
                  <li key={payment.id} className="relative flex gap-4">
                    {idx !== payable.payments.length - 1 && (
                      <span className="absolute top-6 bottom-[-20px] left-[7px] w-px bg-border" />
                    )}
                    <span className="relative mt-1 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/20 ring-4 ring-card">
                      <span className="size-1.5 rounded-full bg-primary" />
                    </span>
                    <div className="flex flex-1 items-start justify-between gap-3 text-sm">
                      <div>
                        <p className="font-medium text-foreground">
                          {formatShortDate(payment.payment_date)}
                        </p>
                        <p className="mt-0.5 font-medium text-muted-foreground text-xs capitalize">
                          {payment.method.replace(/_/g, " ")}
                        </p>
                      </div>
                      <span className="font-semibold text-foreground tabular-nums">
                        {formatCurrency(payment.amount)}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="mt-6 rounded-xl border border-dashed p-6 text-center">
                <p className="font-medium text-sm text-foreground">No payments</p>
                <p className="mt-1 text-muted-foreground text-xs">Payments will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      {payable && (
        <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record payment</DialogTitle>
              <DialogDescription>
                Outstanding balance: {formatCurrency(outstanding)}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="payment-amount">Amount</Label>
                <Input
                  id="payment-amount"
                  inputMode="numeric"
                  value={formatNumberInput(amount)}
                  onChange={(event) =>
                    setAmount(event.target.value.replace(/\D/g, ""))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Payment date</Label>
                <DatePicker value={paymentDate} onChange={setPaymentDate} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="payment-method">Payment method</Label>
                <select
                  id="payment-method"
                  value={method}
                  onChange={(event) => setMethod(event.target.value)}
                  className="h-10 rounded-lg border bg-background px-3 text-sm"
                >
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank transfer</option>
                  <option value="mobile_money">Mobile money</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="payment-reference">Reference</Label>
                <Input
                  id="payment-reference"
                  value={reference}
                  onChange={(event) => setReference(event.target.value)}
                  placeholder="Optional"
                />
              </div>
              {error && <ErrorNotice error={error} />}
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setPaymentOpen(false)}>
                Cancel
              </Button>
              <Button
                disabled={saving}
                onClick={async () => {
                  setSaving(true)
                  setError("")
                  const result = await recordReceiptPaymentAction({
                    expenseId: payable.id,
                    projectId: payable.project_id,
                    supplierId: payable.supplier_id,
                    amount: Number(amount),
                    outstandingAmount: outstanding,
                    currency: payable.currency,
                    paymentDate,
                    method,
                    reference,
                  })
                  if (!result.success) {
                    setError(result.error)
                    setSaving(false)
                    return
                  }
                  setPaymentOpen(false)
                  setSaving(false)
                  router.refresh()
                }}
              >
                {saving
                  ? "Saving..."
                  : Number(amount) === outstanding
                    ? "Pay in full"
                    : "Record payment"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </DashboardShell>
  )
}

function formatNumberInput(value: string) {
  const number = Number(value.replace(/\D/g, ""))
  return number ? new Intl.NumberFormat("en-US").format(number) : ""
}
