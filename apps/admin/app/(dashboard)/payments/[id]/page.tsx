import {
  ArrowLeft02Icon,
  BanknoteIcon,
  Building03Icon,
  CreditCardIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import Link from "next/link"
import { notFound } from "next/navigation"
import { AdminDashboardShell } from "@/components/dashboard-shell"
import { StatCard } from "@/components/stat-card"
import { listPlatformPayments } from "@/core/finance/service"
import { formatCompactCurrency, formatCreatedDate } from "@/lib/format-currency"

function formatFullCurrency(amountCents: number, currency = "UGX") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amountCents / 100)
}

export default async function PaymentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const payments = await listPlatformPayments()
  const payment = payments.find((p) => p.id === id)

  if (!payment) {
    notFound()
  }

  const currency = payment.currency || "UGX"

  return (
    <AdminDashboardShell>
      {/* ── Top Navigation Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon-sm" asChild className="rounded-xl">
            <Link href="/payments" aria-label="Back to payments">
              <HugeiconsIcon icon={ArrowLeft02Icon} className="size-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-heading font-semibold text-xl tracking-tight">
                Payment Transaction
              </h2>
              <Badge variant="outline" className="capitalize font-medium text-xs">
                {payment.method ? payment.method.replace("_", " ") : "Completed"}
              </Badge>
            </div>
            <p className="mt-0.5 text-muted-foreground text-xs">
              Organization: {payment.organizationName} · Processed {formatCreatedDate(payment.paymentDate || payment.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* ── Payment Banner ── */}
      <Card className="overflow-hidden border bg-gradient-to-r from-card via-card to-muted/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
              Payment Overview
            </CardTitle>
            <Badge variant="secondary" className="capitalize text-xs">
              {payment.method ? payment.method.replace("_", " ") : "Standard"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-heading font-semibold text-2xl tracking-tight">
                {payment.organizationName}
              </h3>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground text-xs">
                <span className="flex items-center gap-1.5">
                  <HugeiconsIcon icon={UserGroupIcon} className="size-3.5" />
                  Supplier: {payment.supplierName || "Unassigned"}
                </span>
                {payment.reference && (
                  <span className="flex items-center gap-1.5 font-mono">
                    Ref: {payment.reference}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col text-right">
              <span className="font-semibold text-2xl text-foreground tabular-nums">
                {formatCompactCurrency(payment.amountCents, currency)}
              </span>
              <span className="text-muted-foreground text-xs">
                {formatFullCurrency(payment.amountCents, currency)} Total Paid
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Metrics Stats Cards Grid ── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          title="Payment Amount"
          value={formatCompactCurrency(payment.amountCents, currency)}
          accent="emerald"
          icon={
            <HugeiconsIcon
              icon={BanknoteIcon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
          description={formatFullCurrency(payment.amountCents, currency)}
        />
        <StatCard
          title="Payment Method"
          value={payment.method ? payment.method.replace("_", " ") : "Standard"}
          accent="blue"
          icon={
            <HugeiconsIcon
              icon={CreditCardIcon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
          description="Settlement channel"
        />
        <StatCard
          title="Organization"
          value={payment.organizationName}
          accent="default"
          icon={
            <HugeiconsIcon
              icon={Building03Icon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
          description="Tenant organization"
        />
        <StatCard
          title="Payment Date"
          value={formatCreatedDate(payment.paymentDate || payment.createdAt)}
          accent="default"
          icon={
            <HugeiconsIcon
              icon={BanknoteIcon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
          description="Transaction date"
        />
      </div>

      {/* ── Specifications Cards ── */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Transaction Details
            </CardTitle>
            <CardDescription>
              Payment breakdown and metadata.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between border-b pb-3">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-semibold">{formatFullCurrency(payment.amountCents, currency)}</span>
            </div>
            <div className="flex justify-between border-b pb-3">
              <span className="text-muted-foreground">Payment Method</span>
              <span className="font-medium capitalize">{payment.method ? payment.method.replace("_", " ") : "Standard"}</span>
            </div>
            {payment.reference && (
              <div className="flex justify-between border-b pb-3">
                <span className="text-muted-foreground">Reference</span>
                <span className="font-mono text-xs">{payment.reference}</span>
              </div>
            )}
            <div className="flex justify-between border-b pb-3">
              <span className="text-muted-foreground">Organization</span>
              <span className="font-medium">{payment.organizationName}</span>
            </div>
            <div className="flex justify-between border-b pb-3">
              <span className="text-muted-foreground">Supplier</span>
              <span className="font-medium">{payment.supplierName || "—"}</span>
            </div>
            <div className="flex justify-between border-b pb-3">
              <span className="text-muted-foreground">Transaction Date</span>
              <span>{formatCreatedDate(payment.paymentDate || payment.createdAt)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Settlement Status
            </CardTitle>
            <CardDescription>
              Transaction audit verification.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p className="text-xs text-muted-foreground leading-relaxed">
              This payment transaction was recorded and verified in the platform ledger.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminDashboardShell>
  )
}
