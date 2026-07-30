import {
  getAdminSupplierDetailUseCase,
  getAdminSupplierPaymentsUseCase,
  getOrganizationDetailUseCase,
} from "@workspace/api"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Coins01Icon,
  ReceiptTextIcon,
  UserGroupIcon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons"
import { notFound } from "next/navigation"
import { AdminDashboardShell } from "@/components/dashboard-shell"
import { BreadcrumbSetter } from "@/components/breadcrumb-context"
import { SupplierPaymentsTable } from "@/components/org-detail/supplier-payments-table"
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

export default async function SupplierDetailPage({
  params,
}: {
  params: Promise<{ id: string; supplierId: string }>
}) {
  const { id: organizationId, supplierId } = await params

  let supplier
  let orgName: string
  try {
    ;[supplier, orgName] = await Promise.all([
      getAdminSupplierDetailUseCase(organizationId, supplierId),
      getOrganizationDetailUseCase(organizationId).then((o) => o?.name ?? "Organization"),
    ])
  } catch {
    notFound()
  }

  const payments = await getAdminSupplierPaymentsUseCase(
    organizationId,
    supplierId
  )

  const totalPaid = payments.reduce((sum, p) => sum + p.amountCents, 0)

  return (
    <>
      <BreadcrumbSetter
        items={[
          { label: "Organizations", href: "/organizations" },
          { label: orgName, href: `/organizations/${organizationId}` },
          { label: "Suppliers", href: `/organizations/${organizationId}?tab=suppliers` },
          { label: toTitleCase(supplier.name) },
        ]}
      />
      <AdminDashboardShell
        title={
          <span className="flex flex-wrap items-center gap-2.5">
            {toTitleCase(supplier.name)}
            <StatusBadge status={supplier.status} />
          </span>
        }
      description={`Created ${formatDate(supplier.createdAt)}`}
    >
      <div className="mt-4 flex flex-col gap-4">
        {/* ── Supplier analytics header ── */}
        <section>
          <p className="mb-2 font-semibold text-[10px] text-primary uppercase tracking-[0.16em]">
            Supplier analytics
          </p>
        </section>

        {/* ── Supplier stats ── */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            title="Total Paid"
            value={formatCompactCurrency(totalPaid, payments[0]?.currency ?? "UGX")}
            icon={
              <HugeiconsIcon
                icon={Coins01Icon}
                strokeWidth={1.7}
                className="size-4"
              />
            }
            description={`${payments.length} ${payments.length === 1 ? "payment" : "payments"}`}
          />
          <StatCard
            title="Payments"
            value={payments.length}
            icon={
              <HugeiconsIcon
                icon={ReceiptTextIcon}
                strokeWidth={1.7}
                className="size-4"
              />
            }
            description="All-time transactions"
          />
          <StatCard
            title="Category"
            value={supplier.category ? toTitleCase(supplier.category) : "Other"}
            icon={
              <HugeiconsIcon
                icon={UserGroupIcon}
                strokeWidth={1.7}
                className="size-4"
              />
            }
            description="Supplier classification"
          />
          <StatCard
            title="Contact"
            value={supplier.phone ?? supplier.email ?? "—"}
            icon={
              <HugeiconsIcon
                icon={Wallet01Icon}
                strokeWidth={1.7}
                className="size-4"
              />
            }
            description={supplier.contactName ?? "No contact name"}
          />
        </div>

        {/* ── Payment history ── */}
        <SupplierPaymentsTable
          payments={payments}
          organizationId={organizationId}
          title="Payment history"
        />
      </div>
    </AdminDashboardShell>
    </>
  )
}
