import {
  Building03Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  Invoice01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { AdminDashboardShell } from "@/components/dashboard-shell"
import { ReceiptItem, ReceiptsTable } from "@/components/receipts-table"
import { StatCard } from "@/components/stat-card"
import { listPlatformReceipts } from "@/core/finance/service"

export default async function ReceiptsPage() {
  const receipts = await listPlatformReceipts()

  const tableData: ReceiptItem[] = (receipts as ReceiptItem[]).map((r) => ({
    id: r.id,
    paymentStatus: r.paymentStatus,
    expenseDate: r.expenseDate,
    createdAt: r.createdAt,
    organizationName: r.organizationName,
    projectName: r.projectName,
    supplierName: r.supplierName,
  }))

  const paidCount = receipts.filter((r) => r.paymentStatus === "paid").length
  const pendingCount = receipts.filter(
    (r) => r.paymentStatus === "pending" || r.paymentStatus === "unpaid"
  ).length
  const orgsCount = new Set(receipts.map((r) => r.organizationName)).size

  return (
    <AdminDashboardShell>
      {/* ── Subtitle header ── */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          Platform-wide receipt and expense log monitoring.
        </p>
      </div>

      {/* ── Top Receipts Stats Cards Row ── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          title="Total Receipts"
          value={receipts.length}
          accent="blue"
          trend={{
            value: 12,
            label: "vs last month",
            isPositive: true,
          }}
          icon={
            <HugeiconsIcon
              icon={Invoice01Icon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
        />
        <StatCard
          title="Paid Receipts"
          value={paidCount}
          accent="emerald"
          trend={{
            value: paidCount,
            label: "settled receipts",
            isPositive: true,
          }}
          icon={
            <HugeiconsIcon
              icon={CheckmarkCircle02Icon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
          description={`${paidCount} fully paid`}
        />
        <StatCard
          title="Pending / Unpaid"
          value={pendingCount}
          accent={pendingCount > 0 ? "amber" : "default"}
          trend={{
            value: pendingCount,
            label: "unsettled receipts",
            isPositive: pendingCount === 0,
          }}
          icon={
            <HugeiconsIcon
              icon={Clock01Icon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
          description={pendingCount > 0 ? `${pendingCount} unpaid receipts` : "All paid"}
        />
        <StatCard
          title="Organizations"
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

      {/* ── Real TanStack Table for Receipts ── */}
      <ReceiptsTable data={tableData} />
    </AdminDashboardShell>
  )
}
