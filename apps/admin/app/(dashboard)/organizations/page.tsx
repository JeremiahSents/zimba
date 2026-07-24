import {
  AlertCircleIcon,
  Building03Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { AdminDashboardShell } from "@/components/dashboard-shell"
import {
  OrganizationItem,
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

  const tableData: OrganizationItem[] = (organizations as OrganizationItem[]).map(
    (org) => ({
      id: org.id,
      name: org.name,
      status: org.status,
      userCount: org.userCount ?? 0,
      projectCount: org.projectCount ?? 0,
      createdAt: org.createdAt,
    })
  )

  const activeRatio = stats.totalOrganizations
    ? Math.round((stats.activeOrganizations / stats.totalOrganizations) * 100)
    : 0

  return (
    <AdminDashboardShell>
      {/* ── Subtitle header ── */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          Manage, monitor, and update status for all tenant organizations.
        </p>
      </div>

      {/* ── Top stats row for organizations with trend lines ── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          title="Total Organizations"
          value={stats.totalOrganizations}
          accent="blue"
          trend={{
            value: 12,
            label: "vs last month",
            isPositive: true,
          }}
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
          trend={{
            value: activeRatio,
            label: "active rate",
            isPositive: true,
          }}
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
          trend={{
            value: 5,
            label: "new trial users",
            isPositive: true,
          }}
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
          trend={{
            value: stats.suspendedOrganizations,
            label: "flagged tenants",
            isPositive: false,
          }}
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
  )
}
