import {
  AlertCircleIcon,
  Building03Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { AdminDashboardShell } from "@/components/dashboard-shell"
import { BreadcrumbSetter } from "@/components/breadcrumb-context"
import {
  type OrganizationItem,
  OrganizationsTable,
} from "@/components/organizations-table"
import { StatCard } from "@/components/stat-card"
import { listOrganizations } from "@/core/organizations/service"
import { getPlatformStats } from "@/core/platform/service"

export default async function OrganizationsPage() {
  const [organizations, stats] = await Promise.all([
    listOrganizations(),
    getPlatformStats(),
  ])

  const tableData: OrganizationItem[] = (
    organizations as OrganizationItem[]
  ).map((org) => ({
    id: org.id,
    name: org.name,
    status: org.status,
    userCount: org.userCount ?? 0,
    projectCount: org.projectCount ?? 0,
    createdAt: org.createdAt,
  }))

  return (
    <>
      <BreadcrumbSetter items={[{ label: "Organizations" }]} />
      <AdminDashboardShell
        boneName="admin-organizations"
        title="Organizations"
        description="Manage, monitor, and update status for all tenant organizations."
      >
      {/* ── Top stats row for organizations ── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          title="Total Organizations"
          value={stats.totalOrganizations}
          accent="blue"
          icon={
            <HugeiconsIcon
              icon={Building03Icon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
        />
        <StatCard
          title="Active Organizations"
          value={stats.activeOrganizations}
          accent="emerald"
          icon={
            <HugeiconsIcon
              icon={CheckmarkCircle02Icon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
          description={`${stats.activeOrganizations} active tenants`}
        />
        <StatCard
          title="Trial Organizations"
          value={stats.trialOrganizations}
          accent="amber"
          icon={
            <HugeiconsIcon
              icon={Clock01Icon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
          description={`${stats.trialOrganizations} currently in trial`}
        />
        <StatCard
          title="Suspended / Attention"
          value={stats.suspendedOrganizations}
          accent={stats.suspendedOrganizations > 0 ? "rose" : "default"}
          icon={
            <HugeiconsIcon
              icon={AlertCircleIcon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
          description={
            stats.suspendedOrganizations > 0
              ? `${stats.suspendedOrganizations} require admin review`
              : "No suspended tenants"
          }
        />
      </div>

      {/* ── Real TanStack Table with filtering, search & custom status dropdown ── */}
      <OrganizationsTable data={tableData} />
    </AdminDashboardShell>
    </>
  )
}
