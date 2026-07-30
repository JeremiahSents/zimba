import { getAdminPaymentDetailUseCase } from "@workspace/api"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowUpRight01Icon,
  BanknoteIcon,
  Call02Icon,
  Calendar03Icon,
  File02Icon,
  Image02Icon,
  Mail01Icon,
  ReceiptTextIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import Link from "next/link"
import { notFound } from "next/navigation"
import { AdminDashboardShell } from "@/components/dashboard-shell"
import { StatCard } from "@/components/stat-card"
import { StatusBadge } from "@/components/status-badge"
import { formatCompactCurrency } from "@/lib/format-currency"

function getOrdinalSuffix(day: number): string {
  if (day > 3 && day < 21) return "th"
  switch (day % 10) {
    case 1:
      return "st"
    case 2:
      return "nd"
    case 3:
      return "rd"
    default:
      return "th"
  }
}

function formatDate(dateInput: Date | string) {
  const d = new Date(dateInput)
  const day = d.getDate()
  const month = d.toLocaleDateString("en-US", { month: "long" })
  const year = d.getFullYear()
  return `${day}${getOrdinalSuffix(day)} ${month}, ${year}`
}

function toTitleCase(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, " ")
    .replace(/\b\p{L}/gu, (match) => match.toUpperCase())
}

export default async function PaymentDetailPage({
  params,
}: {
  params: Promise<{ id: string; paymentId: string }>
}) {
  const { id: organizationId, paymentId } = await params

  let payment
  try {
    payment = await getAdminPaymentDetailUseCase(organizationId, paymentId)
  } catch {
    notFound()
  }

  const isImage = payment.receiptContentType?.startsWith("image/")
  const hasReceipt = Boolean(payment.receiptFileUrl)

  return (
    <AdminDashboardShell
      title={
        <span className="flex flex-wrap items-center gap-2.5">
          {formatCompactCurrency(payment.amountCents, payment.currency)}
          <StatusBadge status="paid" />
        </span>
      }
      description={`Payment recorded ${formatDate(payment.paymentDate ?? payment.createdAt)}`}
    >
      <div className="mt-4 flex flex-col gap-4">
        {/* ── Payment analytics header ── */}
        <section>
          <p className="mb-2 font-semibold text-[10px] text-primary uppercase tracking-[0.16em]">
            Payment details
          </p>
        </section>

        {/* ── Payment stats ── */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            title="Amount"
            value={formatCompactCurrency(
              payment.amountCents,
              payment.currency
            )}
            icon={
              <HugeiconsIcon
                icon={BanknoteIcon}
                strokeWidth={1.7}
                className="size-4"
              />
            }
            description={payment.method ? toTitleCase(payment.method) : "Method not recorded"}
          />
          <StatCard
            title="Supplier"
            value={
              payment.supplierName ? toTitleCase(payment.supplierName) : "—"
            }
            icon={
              <HugeiconsIcon
                icon={UserGroupIcon}
                strokeWidth={1.7}
                className="size-4"
              />
            }
            description={payment.supplierEmail ?? payment.supplierPhone ?? "No contact"}
          />
          <StatCard
            title="Project"
            value={
              payment.projectName ? toTitleCase(payment.projectName) : "—"
            }
            icon={
              <HugeiconsIcon
                icon={ReceiptTextIcon}
                strokeWidth={1.7}
                className="size-4"
              />
            }
            description={payment.projectId ? "Associated project" : "No project linked"}
          />
          <StatCard
            title="Reference"
            value={payment.reference ?? "—"}
            icon={
              <HugeiconsIcon
                icon={Calendar03Icon}
                strokeWidth={1.7}
                className="size-4"
              />
            }
            description="Payment reference"
          />
        </div>

        {/* ── Payment info card ── */}
        <Card>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3 border-b pb-4">
              <div>
                <h2 className="font-heading font-semibold text-foreground text-lg tracking-tight">
                  Payment summary
                </h2>
                <p className="mt-1 text-muted-foreground text-sm">
                  {payment.supplierName
                    ? toTitleCase(payment.supplierName)
                    : "Unknown supplier"}{" "}
                  · {formatCompactCurrency(payment.amountCents, payment.currency)}
                </p>
              </div>
            </div>

            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailRow label="Amount" value={formatCompactCurrency(payment.amountCents, payment.currency)} />
              <DetailRow label="Currency" value={payment.currency} />
              <DetailRow label="Method" value={payment.method ? toTitleCase(payment.method) : "—"} />
              <DetailRow label="Reference" value={payment.reference ?? "—"} />
              <DetailRow label="Payment date" value={payment.paymentDate ? formatDate(payment.paymentDate) : "—"} />
              <DetailRow label="Recorded" value={formatDate(payment.createdAt)} />
            </dl>

            {/* ── Supplier contact ── */}
            {(payment.supplierPhone || payment.supplierEmail) && (
              <div className="border-t pt-4">
                <p className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
                  Supplier contact
                </p>
                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                  {payment.supplierPhone && (
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                      <HugeiconsIcon icon={Call02Icon} className="size-4" />
                      {payment.supplierPhone}
                    </span>
                  )}
                  {payment.supplierEmail && (
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                      <HugeiconsIcon icon={Mail01Icon} className="size-4" />
                      {payment.supplierEmail}
                    </span>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Receipt file ── */}
        {hasReceipt && (
          <Card>
            <CardContent>
              <p className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
                Receipt file
              </p>
              <div className="mt-3">
                <a
                  href={payment.receiptFileUrl ?? "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border p-4 font-medium text-primary text-sm transition-colors hover:bg-primary/5"
                >
                  <HugeiconsIcon
                    icon={isImage ? Image02Icon : File02Icon}
                    strokeWidth={1.7}
                    className="size-4"
                  />
                  Open {payment.receiptFileName ?? "receipt"}
                  <HugeiconsIcon
                    icon={ArrowUpRight01Icon}
                    strokeWidth={1.8}
                    className="size-3.5"
                  />
                </a>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Navigation links ── */}
        <div className="flex flex-wrap gap-3">
          {payment.supplierId && (
            <Button variant="outline" size="sm" asChild>
              <Link
                href={`/organizations/${organizationId}/suppliers/${payment.supplierId}`}
              >
                View supplier
              </Link>
            </Button>
          )}
          {payment.projectId && (
            <Button variant="outline" size="sm" asChild>
              <Link
                href={`/organizations/${organizationId}/projects/${payment.projectId}`}
              >
                View project
              </Link>
            </Button>
          )}
        </div>
      </div>
    </AdminDashboardShell>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] text-muted-foreground uppercase tracking-wide">
        {label}
      </dt>
      <dd className="mt-1 font-medium text-sm text-foreground">{value}</dd>
    </div>
  )
}
