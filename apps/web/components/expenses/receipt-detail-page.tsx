"use client"

import {
  ArrowLeft01Icon,
  Call02Icon,
  Download01Icon,
  Mail01Icon,
  PrinterIcon,
  Share08Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
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
import { Progress } from "@workspace/ui/components/progress"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ReceiptCategoryDialog } from "@/components/expenses/receipt-category-dialog"
import { ReceiptFiles } from "@/components/expenses/receipt-files"
import { formatReceiptNumber } from "@/components/expenses/receipt-number"
import { DashboardShell } from "@/components/shared/dashboard-shell"
import { DatePicker } from "@/components/shared/date-picker"
import { ErrorNotice } from "@/components/shared/error-notice"
import { useWorkspaceSlug } from "@/components/shared/use-workspace-slug"
import { useWorkspace } from "@/components/shared/workspace-context"
import {
  correctReceiptCategoryAction,
  deleteReceiptAction,
} from "@/core/expenses/actions"
import {
  markReceiptFullyPaidAction,
  recordReceiptPaymentAction,
} from "@/core/payments/actions"
import type { PublicError } from "@/core/shared/errors"
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
  allocations = [],
}: {
  items: ExpenseTableRow[]
  supplier?: SupplierResponse
  payable?: PayableExpenseResponse
  allocations?: Array<{ id: string; name: string; budget: number }>
}) {
  const router = useRouter()
  const workspace = useWorkspace()
  const slug = useWorkspaceSlug()
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
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [selectedAllocation, setSelectedAllocation] = useState("")
  const [correcting, setCorrecting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const paidPercent =
    total > 0 ? Math.min(Math.round((paid / total) * 100), 100) : 0
  const status =
    outstanding === 0
      ? { label: "Paid in full", pill: "bg-green-50 text-green-600" }
      : paid > 0
        ? { label: "Partially paid", pill: "bg-amber-50 text-amber-600" }
        : { label: "Not paid", pill: "bg-slate-100 text-slate-600" }
  const receiptNumber = formatReceiptNumber({
    fallbackId: payable?.id ?? first.id,
    organizationName: workspace.organizationName,
    receiptNumber: payable?.receipt_number,
  })

  return (
    <DashboardShell>
      <Link
        href={`/${slug}/projects`}
        className="inline-flex items-center gap-1.5 text-primary text-sm hover:underline"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} size={16} /> Back
      </Link>
      <div className="mb-6 flex flex-wrap justify-end gap-2 print:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCategoryOpen(true)}
          disabled={!payable?.project_id || allocations.length === 0}
        >
          {payable?.category_state === "uncategorized"
            ? "Categorize"
            : "Change category"}
        </Button>
        {first.receipt_url && (
          <Button variant="outline" size="sm" asChild>
            <a href={first.receipt_url} target="_blank" rel="noreferrer">
              <HugeiconsIcon icon={Download01Icon} size={16} />
              Original photo
            </a>
          </Button>
        )}
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Print"
          onClick={() => window.print()}
        >
          <HugeiconsIcon icon={PrinterIcon} size={16} />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Share"
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
        <Button
          variant="destructive"
          size="sm"
          disabled={deleting}
          onClick={async () => {
            if (
              !payable ||
              !window.confirm("Delete this receipt? This cannot be undone.")
            )
              return
            setDeleting(true)
            const result = await deleteReceiptAction(
              payable.id,
              payable.project_id
            )
            setDeleting(false)
            if (!result.success) return setError(result.error)
            router.push(`/${slug}/expenses`)
          }}
        >
          {deleting ? "Deleting…" : "Delete"}
        </Button>
      </div>

      <ReceiptFiles files={payable?.attachments ?? []} />

      <div className="mx-auto mt-6 grid max-w-6xl items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="receipt-print-area">
          <CardContent className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3 border-b pb-6">
              <div>
                <h1 className="font-heading font-semibold text-foreground text-xl tracking-tight">
                  {first.supplier_name}
                </h1>
                <p className="mt-1 text-muted-foreground text-sm">
                  {first.project_name} · {formatShortDate(first.date)} ·{" "}
                  {receiptNumber}
                </p>
                {(supplier?.phone || supplier?.email) && (
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground text-xs">
                    {supplier?.phone && (
                      <span className="inline-flex items-center gap-1.5">
                        <HugeiconsIcon icon={Call02Icon} className="size-3.5" />
                        {supplier.phone}
                      </span>
                    )}
                    {supplier?.email && (
                      <span className="inline-flex items-center gap-1.5">
                        <HugeiconsIcon icon={Mail01Icon} className="size-3.5" />
                        {supplier.email}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <span
                className={`shrink-0 rounded-lg px-2 py-0.5 font-medium text-[10px] ${status.pill}`}
              >
                {status.label}
              </span>
            </div>

            <div>
              <p className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
                Items
              </p>
              <div className="mt-3 divide-y">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-4 py-3 first:pt-0"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-foreground text-sm">
                        {item.item_description}
                      </p>
                      <p className="mt-0.5 text-muted-foreground text-xs">
                        {item.task_name}
                        {item.quantity && item.quantity > 1
                          ? ` · ${item.quantity} × ${formatCurrency(item.unit_rate ?? item.amount)}`
                          : ""}
                      </p>
                    </div>
                    <p className="shrink-0 font-heading font-semibold text-foreground text-sm tabular-nums">
                      {formatCurrency(item.amount)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-baseline justify-between border-t pt-4">
              <span className="font-medium text-muted-foreground text-sm">
                Total
              </span>
              <span className="font-bold font-heading text-foreground text-xl tabular-nums tracking-tight">
                {formatCurrency(total)}
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6 print:hidden">
          <Card>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <p className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
                    Outstanding
                  </p>
                  <span
                    className={`rounded-lg px-2 py-0.5 font-medium text-[10px] ${status.pill}`}
                  >
                    {status.label}
                  </span>
                </div>
                <p className="mt-2 font-bold font-heading text-3xl text-foreground tabular-nums tracking-tight">
                  {formatCurrency(outstanding)}
                </p>
              </div>
              <div>
                <div className="mb-2 flex justify-between font-medium text-xs">
                  <span className="text-muted-foreground">Amount paid</span>
                  <span className="text-foreground">{paidPercent}%</span>
                </div>
                <Progress value={paidPercent} className="h-2" />
                <p className="mt-2 text-muted-foreground text-xs">
                  <span className="text-foreground">
                    {formatCurrency(paid)}
                  </span>{" "}
                  of {formatCurrency(total)} settled
                </p>
              </div>
              {payable && outstanding > 0 && (
                <div className="grid gap-2 border-t pt-4">
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
                      if (!result.success) return setError(result.error)
                      router.refresh()
                    }}
                  >
                    {markingPaid ? "Processing…" : "Mark fully paid"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPaymentOpen(true)}
                  >
                    Record partial payment
                  </Button>
                </div>
              )}
              {error && !paymentOpen && <ErrorNotice error={error} />}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <p className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
                Payment history
              </p>
              {payable?.payments.length ? (
                <ol className="mt-4 space-y-4">
                  {payable.payments.map((payment, idx) => (
                    <li key={payment.id} className="relative flex gap-3">
                      {idx !== payable.payments.length - 1 && (
                        <span className="absolute top-5 bottom-[-16px] left-[5px] w-px bg-border" />
                      )}
                      <span className="relative mt-1.5 flex size-2.5 shrink-0 items-center justify-center rounded-full bg-primary" />
                      <div className="flex flex-1 items-start justify-between gap-3 text-sm">
                        <div>
                          <p className="font-medium text-foreground">
                            {formatShortDate(payment.payment_date)}
                          </p>
                          <p className="mt-0.5 text-muted-foreground text-xs capitalize">
                            {payment.method.replace(/_/g, " ")}
                          </p>
                        </div>
                        <span className="font-medium text-foreground tabular-nums">
                          {formatCurrency(payment.amount)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-3 text-muted-foreground text-sm">
                  No payments recorded yet.
                </p>
              )}
            </CardContent>
          </Card>
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
      <ReceiptCategoryDialog
        open={categoryOpen}
        onOpenChange={setCategoryOpen}
        allocations={allocations}
        selectedAllocation={selectedAllocation}
        onSelect={setSelectedAllocation}
        payable={Boolean(payable)}
        correcting={correcting}
        error={error}
        onSave={async () => {
          if (!payable) return
          setCorrecting(true)
          setError("")
          const result = await correctReceiptCategoryAction(
            payable.id,
            payable.project_id,
            selectedAllocation
          )
          setCorrecting(false)
          if (!result.success) return setError(result.error)
          setCategoryOpen(false)
          router.refresh()
        }}
      />
    </DashboardShell>
  )
}

function formatNumberInput(value: string) {
  const number = Number(value.replace(/\D/g, ""))
  return number ? new Intl.NumberFormat("en-US").format(number) : ""
}
