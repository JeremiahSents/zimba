import {
  ActivityIcon,
  Building03Icon,
  CheckmarkCircle02Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { ActivityItem, ActivityTable } from "@/components/activity-table"
import { AdminDashboardShell } from "@/components/dashboard-shell"
import { StatCard } from "@/components/stat-card"
import { listPlatformAuditLogs } from "@/core/audit/service"

export default async function ActivityPage() {
  const logs = await listPlatformAuditLogs()

  const tableData: ActivityItem[] = (logs as ActivityItem[]).map((log) => ({
    id: log.id,
    action: log.action,
    entityType: log.entityType,
    entityId: log.entityId,
    changes: log.changes,
    createdAt: log.createdAt,
    organizationName: log.organizationName,
    actorName: log.actorName,
  }))

  const uniqueActors = new Set(logs.map((l) => l.actorName)).size
  const uniqueOrgs = new Set(logs.map((l) => l.organizationName)).size
  const uniqueActions = new Set(logs.map((l) => l.action)).size

  return (
    <AdminDashboardShell>
      {/* ── Subtitle header ── */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          Platform-wide audit, user operations, and activity logs.
        </p>
      </div>

      {/* ── Top Activity Stats Cards Row ── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          title="Total Events"
          value={logs.length}
          accent="blue"
          trend={{
            value: 15,
            label: "vs last month",
            isPositive: true,
          }}
          icon={
            <HugeiconsIcon
              icon={ActivityIcon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
        />
        <StatCard
          title="Active Actors"
          value={uniqueActors}
          accent="emerald"
          trend={{
            value: uniqueActors,
            label: "active users",
            isPositive: true,
          }}
          icon={
            <HugeiconsIcon
              icon={UserGroupIcon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
          description={`${uniqueActors} unique team actors`}
        />
        <StatCard
          title="Organizations"
          value={uniqueOrgs}
          accent="amber"
          icon={
            <HugeiconsIcon
              icon={Building03Icon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
          description={`Across ${uniqueOrgs} tenant orgs`}
        />
        <StatCard
          title="Action Types"
          value={uniqueActions}
          accent="default"
          icon={
            <HugeiconsIcon
              icon={CheckmarkCircle02Icon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
          description={`${uniqueActions} distinct audit events`}
        />
      </div>

      {/* ── Real TanStack Table for Activity (No Entity column) ── */}
      <ActivityTable data={tableData} />
    </AdminDashboardShell>
  )
}
