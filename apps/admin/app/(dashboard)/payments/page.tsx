import {
  BanknoteIcon,
  Building03Icon,
  CheckmarkCircle02Icon,
  CreditCardIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { AdminDashboardShell } from "@/components/dashboard-shell"
import { PaymentItem, PaymentsTable } from "@/components/payments-table"
import { StatCard } from "@/components/stat-card"
import { listPlatformPayments } from "@/core/finance/service"
import { formatCompactCurrency } from "@/lib/format-currency"

export default async function PaymentsPage() {
  const payments = await listPlatformPayments()

  const tableData: PaymentItem[] = (payments as PaymentItem[]).map((p) => ({
    id: p.id,
    amountCents: p.amountCents,
    currency: p.currency,
    paymentDate: p.paymentDate,
    method: p.method,
    reference: p.reference,
    createdAt: p.createdAt,
    organizationName: p.organizationName,
    supplierName: p.supplierName,
  }))

  const methodCount = new Set(payments.map((p) => p.method).filter(Boolean))
    .size
  const orgsCount = new Set(payments.map((p) => p.organizationName)).size
  const totalAmountCents = payments.reduce((sum, p) => sum + p.amountCents, 0)
  const primaryCurrency = payments[0]?.currency || "UGX"

  return (
    <AdminDashboardShell>
      {/* ── Subtitle header ── */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          Platform-wide payment transactions, settlement methods, and volume tracking.
        </p>
      </div>

      {/* ── Top Payments Stats Cards Row ── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          title="Total Payments"
          value={payments.length}
          accent="blue"
          trend={{
            value: 14,
            label: "vs last month",
            isPositive: true,
          }}
          icon={
            <HugeiconsIcon
              icon={BanknoteIcon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
        />
        <StatCard
          title="Total Paid Volume"
          value={formatCompactCurrency(totalAmountCents, primaryCurrency)}
          accent="emerald"
          trend={{
            value: 10,
            label: "volume growth",
            isPositive: true,
          }}
          icon={
            <HugeiconsIcon
              icon={CheckmarkCircle02Icon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
          description="Total processed payment volume"
        />
        <StatCard
          title="Payment Methods"
          value={methodCount}
          accent="amber"
          icon={
            <HugeiconsIcon
              icon={CreditCardIcon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
          description={`${methodCount} payment channels`}
        />
        <StatCard
          title="Organizations Served"
          value={orgsCount}
          accent="default"
          icon={
            <HugeiconsIcon
              icon={Building03Icon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
          description={`Across ${orgsCount} tenant orgs`}
        />
      </div>

      {/* ── Real TanStack Table for Payments ── */}
      <PaymentsTable data={tableData} />
    </AdminDashboardShell>
  )
}
