import {
  Building03Icon,
  CheckmarkCircle02Icon,
  Invoice01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { AdminDashboardShell } from "@/components/dashboard-shell"
import { StatCard } from "@/components/stat-card"
import { SupplierItem, SuppliersTable } from "@/components/suppliers-table"
import { listPlatformSuppliers } from "@/core/finance/service"

export default async function SuppliersPage() {
  const suppliers = await listPlatformSuppliers()

  const tableData: SupplierItem[] = (suppliers as SupplierItem[]).map((s) => ({
    id: s.id,
    name: s.name,
    phone: s.phone,
    email: s.email,
    category: s.category,
    status: s.status,
    createdAt: s.createdAt,
    organizationName: s.organizationName,
  }))

  const activeCount = suppliers.filter((s) => s.status === "active").length
  const categoriesCount = new Set(
    suppliers.map((s) => s.category).filter(Boolean)
  ).size
  const orgsCount = new Set(suppliers.map((s) => s.organizationName)).size

  return (
    <AdminDashboardShell>
      {/* ── Subtitle header ── */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          Platform-wide vendor and supplier registry across all organizations.
        </p>
      </div>

      {/* ── Top Suppliers Stats Cards Row ── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          title="Total Suppliers"
          value={suppliers.length}
          accent="blue"
          trend={{
            value: 8,
            label: "vs last month",
            isPositive: true,
          }}
          icon={
            <HugeiconsIcon
              icon={UserGroupIcon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
        />
        <StatCard
          title="Active Suppliers"
          value={activeCount}
          accent="emerald"
          trend={{
            value: activeCount,
            label: "currently active",
            isPositive: true,
          }}
          icon={
            <HugeiconsIcon
              icon={CheckmarkCircle02Icon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
          description={`${activeCount} active vendors`}
        />
        <StatCard
          title="Categories"
          value={categoriesCount}
          accent="amber"
          icon={
            <HugeiconsIcon
              icon={Invoice01Icon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
          description={`${categoriesCount} supplier categories`}
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

      {/* ── Real TanStack Table for Suppliers ── */}
      <SuppliersTable data={tableData} />
    </AdminDashboardShell>
  )
}
