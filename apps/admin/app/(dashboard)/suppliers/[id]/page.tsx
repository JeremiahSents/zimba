import {
  ArrowLeft02Icon,
  Building03Icon,
  CallIcon,
  Mail01Icon,
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
import { listPlatformSuppliers } from "@/core/finance/service"
import { formatCreatedDate } from "@/lib/format-currency"

export default async function SupplierDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const suppliers = await listPlatformSuppliers()
  const supplier = suppliers.find((s) => s.id === id)

  if (!supplier) {
    notFound()
  }

  return (
    <AdminDashboardShell>
      {/* ── Top Navigation Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon-sm" asChild className="rounded-xl">
            <Link href="/suppliers" aria-label="Back to suppliers">
              <HugeiconsIcon icon={ArrowLeft02Icon} className="size-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-heading font-semibold text-xl tracking-tight">
                {supplier.name}
              </h2>
              <StatusBadge status={supplier.status} />
            </div>
            <p className="mt-0.5 text-muted-foreground text-xs">
              Category: {supplier.category || "General"} · Registered {formatCreatedDate(supplier.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* ── Supplier Header Banner ── */}
      <Card className="overflow-hidden border bg-gradient-to-r from-card via-card to-muted/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
              Supplier Overview
            </CardTitle>
            <Badge variant="outline" className="capitalize text-xs">
              {supplier.category || "General Vendor"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-heading font-semibold text-2xl tracking-tight">
                {supplier.name}
              </h3>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground text-xs">
                {supplier.phone && (
                  <span className="flex items-center gap-1.5">
                    <HugeiconsIcon icon={CallIcon} className="size-3.5" />
                    {supplier.phone}
                  </span>
                )}
                {supplier.email && (
                  <span className="flex items-center gap-1.5">
                    <HugeiconsIcon icon={Mail01Icon} className="size-3.5" />
                    {supplier.email}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <HugeiconsIcon icon={Building03Icon} className="size-3.5" />
                  Organization: {supplier.organizationName}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Metrics Stats Cards Grid ── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          title="Supplier Status"
          value={supplier.status}
          accent={supplier.status === "active" ? "emerald" : "default"}
          icon={
            <HugeiconsIcon
              icon={UserGroupIcon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
          description="Registry status"
        />
        <StatCard
          title="Category"
          value={supplier.category || "General"}
          accent="amber"
          icon={
            <HugeiconsIcon
              icon={Building03Icon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
          description="Vendor classification"
        />
        <StatCard
          title="Parent Organization"
          value={supplier.organizationName}
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
          title="Registration Date"
          value={formatCreatedDate(supplier.createdAt)}
          accent="default"
          icon={
            <HugeiconsIcon
              icon={UserGroupIcon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
          description="Date registered"
        />
      </div>

      {/* ── Supplier Details Card ── */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Contact & Classification
            </CardTitle>
            <CardDescription>
              Vendor contact information and specification.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between border-b pb-3">
              <span className="text-muted-foreground">Supplier Name</span>
              <span className="font-semibold">{supplier.name}</span>
            </div>
            <div className="flex justify-between border-b pb-3">
              <span className="text-muted-foreground">Category</span>
              <span className="font-medium capitalize">{supplier.category || "General"}</span>
            </div>
            <div className="flex justify-between border-b pb-3">
              <span className="text-muted-foreground">Phone Number</span>
              <span className="font-medium">{supplier.phone || "—"}</span>
            </div>
            <div className="flex justify-between border-b pb-3">
              <span className="text-muted-foreground">Email Address</span>
              <span className="font-medium">{supplier.email || "—"}</span>
            </div>
            <div className="flex justify-between border-b pb-3">
              <span className="text-muted-foreground">Status</span>
              <StatusBadge status={supplier.status} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Tenant Relationship
            </CardTitle>
            <CardDescription>
              Organization relationship metrics.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between border-b pb-3">
              <span className="text-muted-foreground">Parent Organization</span>
              <span className="font-semibold">{supplier.organizationName}</span>
            </div>
            <div className="flex justify-between border-b pb-3">
              <span className="text-muted-foreground">Registered Date</span>
              <span>{formatCreatedDate(supplier.createdAt)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminDashboardShell>
  )
}
