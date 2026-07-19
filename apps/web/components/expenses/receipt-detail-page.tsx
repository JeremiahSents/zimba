"use client"

import {
  ArrowLeft01Icon,
  Download01Icon,
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
          className="inline-flex items-center gap-2 font-semibold text-primary text-sm transition-colors hover:underline"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} /> Back to projects
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-lg border bg-background px-4 py-2 font-medium text-sm shadow-sm transition-all hover:bg-accent hover:text-accent-foreground"
          >
            <HugeiconsIcon icon={PrinterIcon} size={16} />
            Print
          </button>
          <button type="button" onClick={async () => {
            const data = { title: `Receipt ${payable?.receipt_number ?? first.id}`, text: `${first.supplier_name} · ${formatCurrency(total)}`, url: window.location.href }
            if (navigator.share) await navigator.share(data)
            else await navigator.clipboard.writeText(window.location.href)
          }} className="inline-flex items-center gap-2 rounded-lg border bg-background px-4 py-2 font-medium text-sm shadow-sm transition-all hover:bg-accent">
            <HugeiconsIcon icon={Share08Icon} size={16} /> Share
          </button>
          {first.receipt_url && (
            <a
              href={first.receipt_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border bg-background px-4 py-2 font-medium text-sm shadow-sm transition-all hover:bg-accent"
            >
              <HugeiconsIcon icon={Download01Icon} size={16} />
              View Original File
            </a>
          )}
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl items-start gap-6 lg:grid-cols-[1fr_360px]">
        {/* Receipt Paper Card */}
        <div className="receipt-print-area overflow-hidden rounded-xl border border-gray-100 bg-white text-gray-900 shadow-lg">
          <div className="p-8 sm:p-12">
            {/* Header */}
            <div className="mb-8 flex flex-col items-start justify-between gap-6 border-gray-100 border-b pb-8 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <Avatar size="lg" className="size-12">
                  <AvatarFallback className="bg-primary font-bold text-lg text-primary-foreground">
                    {first.supplier_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="font-bold font-heading text-2xl tracking-tight">
                    {first.supplier_name}
                  </h1>
                  <p className="mt-0.5 text-gray-500 text-sm">
                    {first.project_name} · Project Expense
                  </p>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <h2 className="font-bold font-heading text-3xl text-gray-900 uppercase tracking-wider">
                  Receipt
                </h2>
                <div className="mt-3 space-y-1 font-medium text-gray-600 text-sm">
                  <p>
                    Receipt No:{" "}
                    {payable?.receipt_number ??
                      `RCPT-${first.id.toString().padStart(4, "0")}`}
                  </p>
                  <p>Date: {formatShortDate(first.date)}</p>
                </div>
              </div>
            </div>

            {/* Addresses */}
            <div className="mb-12 grid gap-8 rounded-lg bg-gray-50/50 p-6 sm:grid-cols-2">
              <div>
                <p className="mb-3 font-bold text-gray-500 text-xs uppercase tracking-wider">
                  FROM
                </p>
                <h3 className="font-semibold text-gray-900 text-lg">
                  {first.supplier_name}
                </h3>
                <div className="mt-2 space-y-1 text-gray-600 text-sm">
                  {supplier?.phone && <p>{supplier.phone}</p>}
                  {supplier?.email && <p>{supplier.email}</p>}
                  {supplier?.companyContact && <p>{supplier.companyContact}</p>}
                  {!supplier?.phone &&
                    !supplier?.email &&
                    !supplier?.companyContact && (
                      <p className="text-muted-foreground">Supplier details</p>
                    )}
                </div>
              </div>
              <div>
                <p className="mb-3 font-bold text-gray-500 text-xs uppercase tracking-wider">
                  BILLED TO
                </p>
                <div className="space-y-2 text-sm">
                  <h3 className="font-semibold text-gray-900 text-lg">
                    Zimba consultants
                  </h3>
                  <p className="text-gray-600">{first.project_name}</p>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-8 overflow-x-auto">
              <table className="w-full whitespace-nowrap text-left text-sm">
                <thead>
                  <tr className="border-gray-200 border-y-2">
                    <th className="w-12 px-2 py-4 text-center font-bold text-gray-900 text-xs uppercase tracking-wider">
                      No
                    </th>
                    <th className="px-2 py-4 font-bold text-gray-900 text-xs uppercase tracking-wider">
                      Item Description
                    </th>
                    <th className="px-2 py-4 text-right font-bold text-gray-900 text-xs uppercase tracking-wider">
                      Price
                    </th>
                    <th className="w-24 px-2 py-4 text-center font-bold text-gray-900 text-xs uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-2 py-4 text-right font-bold text-gray-900 text-xs uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((item, index) => (
                    <tr
                      key={item.id}
                      className="group transition-colors hover:bg-gray-50/50"
                    >
                      <td className="px-2 py-4 text-center text-gray-500">
                        {index + 1}.
                      </td>
                      <td className="px-2 py-4">
                        <p className="font-medium text-gray-900">
                          {item.item_description}
                        </p>
                        <p className="mt-1 text-gray-500 text-xs">
                          {item.task_name}
                        </p>
                      </td>
                      <td className="px-2 py-4 text-right text-gray-600 tabular-nums">
                        {formatCurrency(item.unit_rate ?? item.amount)}
                      </td>
                      <td className="px-2 py-4 text-center text-gray-600">
                        {item.quantity ?? 1}
                      </td>
                      <td className="px-2 py-4 text-right font-semibold text-gray-900 tabular-nums">
                        {formatCurrency(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Section */}
            <div className="flex justify-end border-gray-100 border-t pt-6">
              <div className="w-full space-y-3 sm:w-80">
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-gray-500 uppercase">
                    Subtotal:
                  </span>
                  <span className="font-medium text-gray-900 tabular-nums">
                    {formatCurrency(total)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-gray-500 uppercase">
                    Tax:
                  </span>
                  <span className="font-medium text-gray-900 tabular-nums">
                    {formatCurrency(0)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-gray-900 border-t-2 pt-4">
                  <span className="font-bold text-gray-900 uppercase tracking-wider">
                    Grand Total:
                  </span>
                  <span className="font-bold text-gray-900 text-xl tabular-nums">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Sidebar */}
        <div className="space-y-6 print:hidden">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="font-bold text-muted-foreground text-xs uppercase tracking-wider">
                Outstanding
              </p>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 font-medium text-xs ring-1 ring-inset ${statusClasses}`}
              >
                {statusLabel}
              </span>
            </div>
            <p className="mt-2 font-bold text-3xl text-foreground tabular-nums tracking-tight">
              {formatCurrency(outstanding)}
            </p>
            <div className="mt-4">
              <Progress value={paidPercent} />
              <p className="mt-2 text-muted-foreground text-xs">
                {formatCurrency(paid)} of {formatCurrency(total)} paid ({paidPercent}%)
              </p>
            </div>
            {payable && outstanding > 0 && (
              <div className="mt-6 space-y-3">
                <Button
                  className="w-full"
                  disabled={markingPaid}
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
                  {markingPaid ? "Saving…" : "Mark fully paid"}
                </Button>
                <Button
                  variant="secondary"
                  className="w-full"
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

          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <p className="font-bold text-muted-foreground text-xs uppercase tracking-wider">
              Payment history
            </p>
            {payable?.payments.length ? (
              <ol className="mt-4 space-y-4">
                {payable.payments.map((payment) => (
                  <li key={payment.id} className="flex gap-3">
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                    <div className="flex flex-1 items-start justify-between gap-2 text-sm">
                      <div>
                        <p className="font-medium text-foreground">
                          {formatShortDate(payment.payment_date)}
                        </p>
                        <p className="text-muted-foreground text-xs capitalize">
                          {payment.method.replace(/_/g, " ")}
                        </p>
                      </div>
                      <span className="font-semibold tabular-nums">
                        {formatCurrency(payment.amount)}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-4 text-muted-foreground text-sm">
                No payments recorded yet.
              </p>
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
