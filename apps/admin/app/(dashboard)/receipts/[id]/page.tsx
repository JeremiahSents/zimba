import {
  ArrowLeft02Icon,
  Building03Icon,
  FactoryIcon,
  Invoice01Icon,
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
import { StatusBadge } from "@/components/status-badge"
import { listPlatformReceipts } from "@/core/finance/service"
import { formatCreatedDate } from "@/lib/format-currency"

export default async function ReceiptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const receipts = await listPlatformReceipts()
  const receipt = receipts.find((r) => r.id === id)

  if (!receipt) {
    notFound()
  }

  return (
    <AdminDashboardShell>
      {/* ── Top Navigation Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon-sm" asChild className="rounded-xl">
            <Link href="/receipts" aria-label="Back to receipts">
              <HugeiconsIcon icon={ArrowLeft02Icon} className="size-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-heading font-semibold text-xl tracking-tight">
                Receipt Log
              </h2>
              <StatusBadge status={receipt.paymentStatus} />
            </div>
            <p className="mt-0.5 text-muted-foreground text-xs">
              Organization: {receipt.organizationName} · Logged {formatCreatedDate(receipt.expenseDate || receipt.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* ── Receipt Banner ── */}
      <Card className="overflow-hidden border bg-gradient-to-r from-card via-card to-muted/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
              Receipt Details
            </CardTitle>
            <StatusBadge status={receipt.paymentStatus} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-heading font-semibold text-xl tracking-tight">
                {receipt.organizationName}
              </h3>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground text-xs">
                <span className="flex items-center gap-1.5">
                  <HugeiconsIcon icon={FactoryIcon} className="size-3.5" />
                  Project: {receipt.projectName || "Unassigned"}
                </span>
                <span className="flex items-center gap-1.5">
                  <HugeiconsIcon icon={UserGroupIcon} className="size-3.5" />
                  Supplier: {receipt.supplierName || "Unassigned"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Metrics Stats Cards Grid ── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          title="Payment Status"
          value={receipt.paymentStatus}
          accent={receipt.paymentStatus === "paid" ? "emerald" : "amber"}
          icon={
            <HugeiconsIcon
              icon={Invoice01Icon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
          description="Receipt payment status"
        />
        <StatCard
          title="Organization"
          value={receipt.organizationName}
          accent="blue"
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
          title="Project"
          value={receipt.projectName || "Unassigned"}
          accent="default"
          icon={
            <HugeiconsIcon
              icon={FactoryIcon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
          description="Linked project"
        />
        <StatCard
          title="Expense Date"
          value={formatCreatedDate(receipt.expenseDate || receipt.createdAt)}
          accent="default"
          icon={
            <HugeiconsIcon
              icon={Invoice01Icon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
          description="Date logged"
        />
      </div>

      {/* ── Specifications Cards ── */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Receipt Information
            </CardTitle>
            <CardDescription>
              Parent entity and status details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between border-b pb-3">
              <span className="text-muted-foreground">Organization</span>
              <span className="font-semibold">{receipt.organizationName}</span>
            </div>
            <div className="flex justify-between border-b pb-3">
              <span className="text-muted-foreground">Project Name</span>
              <span className="font-medium">{receipt.projectName || "—"}</span>
            </div>
            <div className="flex justify-between border-b pb-3">
              <span className="text-muted-foreground">Supplier Name</span>
              <span className="font-medium">{receipt.supplierName || "—"}</span>
            </div>
            <div className="flex justify-between border-b pb-3">
              <span className="text-muted-foreground">Payment Status</span>
              <StatusBadge status={receipt.paymentStatus} />
            </div>
            <div className="flex justify-between border-b pb-3">
              <span className="text-muted-foreground">Logged Date</span>
              <span>{formatCreatedDate(receipt.expenseDate || receipt.createdAt)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Audit & Sync Status
            </CardTitle>
            <CardDescription>
              Platform audit log.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p className="text-xs text-muted-foreground leading-relaxed">
              This receipt entry was captured and processed via Zimba platform expense management repository.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminDashboardShell>
  )
}
