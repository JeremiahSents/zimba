import {
  ArrowRight02Icon,
  BanknoteIcon,
  Building03Icon,
  CheckmarkCircle02Icon,
  FactoryIcon,
  FileCheckIcon,
  Invoice01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  getPendingApplicationCountUseCase,
  getPendingTransferCountUseCase,
} from "@workspace/api"
import { apiExecutor } from "@workspace/api-runtime"
import { cn } from "@workspace/ui/lib/utils"
import Link from "next/link"
import { AdminDashboardShell } from "@/components/dashboard-shell"
import { StatCard } from "@/components/stat-card"
import { getRecentActivity } from "@/core/audit/activity"
import { getPlatformStats } from "@/core/platform/service"
import { getSystemHealth } from "@/core/system/service"

function formatTimeAgo(date: Date) {
  const now = new Date()
  const diffMs = now.getTime() - new Date(date).getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  if (diffMin < 1) return "Just now"
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDays = Math.floor(diffHr / 24)
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays}d ago`
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

function getActionIcon(action: string) {
  if (action.includes("create") || action.includes("add"))
    return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
  if (action.includes("update") || action.includes("edit"))
    return "bg-blue-500/15 text-blue-600 dark:text-blue-400"
  if (action.includes("delete") || action.includes("remove"))
    return "bg-rose-500/15 text-rose-600 dark:text-rose-400"
  return "bg-primary/10 text-primary"
}

function getActionVerb(action: string) {
  if (action.includes("create")) return "created"
  if (action.includes("update")) return "updated"
  if (action.includes("delete")) return "deleted"
  if (action.includes("approve")) return "approved"
  if (action.includes("reject")) return "rejected"
  return action.replace(/_/g, " ")
}

export default async function OverviewPage() {
  const [stats, recentActivity, healthChecks, pendingApps, pendingTransfers] =
    await Promise.all([
      getPlatformStats(),
      getRecentActivity(8),
      getSystemHealth(),
      getPendingApplicationCountUseCase(apiExecutor),
      getPendingTransferCountUseCase(apiExecutor),
    ])

  const allOperational = healthChecks.every(
    (h) => h.status === "operational"
  )
  const degradedCount = healthChecks.filter(
    (h) => h.status !== "operational"
  ).length

  return (
    <AdminDashboardShell>
      {/* ── Top stats (even 4-column grid) ── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          title="Organizations"
          value={stats.totalOrganizations}
          accent="blue"
          icon={
            <HugeiconsIcon
              icon={Building03Icon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
          description={`${stats.activeOrganizations} active · ${stats.suspendedOrganizations} suspended`}
        />
        <StatCard
          title="Users"
          value={stats.totalUsers}
          accent="default"
          icon={
            <HugeiconsIcon
              icon={UserGroupIcon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
        />
        <StatCard
          title="Receipts"
          value={stats.totalReceipts}
          accent="emerald"
          icon={
            <HugeiconsIcon
              icon={Invoice01Icon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
        />
        <StatCard
          title="Projects"
          value={stats.totalProjects}
          accent="default"
          icon={
            <HugeiconsIcon
              icon={FactoryIcon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
        />
      </div>

      {/* ── Secondary stats row ── */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          title="Payments"
          value={stats.totalPayments}
          accent="emerald"
          icon={
            <HugeiconsIcon
              icon={BanknoteIcon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
          description={
            stats.failedPayments > 0
              ? `${stats.failedPayments} failed`
              : undefined
          }
        />
        <StatCard
          title="Pending Applications"
          value={pendingApps}
          accent={pendingApps > 0 ? "amber" : "default"}
          icon={
            <HugeiconsIcon
              icon={FileCheckIcon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
          description={pendingApps > 0 ? "Awaiting review" : "All clear"}
        />
        <StatCard
          title="Pending Transfers"
          value={pendingTransfers}
          accent={pendingTransfers > 0 ? "amber" : "default"}
          icon={
            <HugeiconsIcon
              icon={UserGroupIcon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
          description={
            pendingTransfers > 0 ? "Needs approval" : "All clear"
          }
        />
      </div>

      {/* ── Bottom section: Activity + Health ── */}
      <div className="grid gap-4 md:grid-cols-5">
        {/* Recent Activity — wider column */}
        <div className="overflow-hidden rounded-xl border bg-card md:col-span-3">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <div>
              <h3 className="font-semibold text-sm leading-none tracking-tight">
                Recent Activity
              </h3>
              <p className="mt-1 text-muted-foreground text-xs">
                Latest events across the platform
              </p>
            </div>
            <Link
              href="/activity"
              className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 font-medium text-muted-foreground text-xs transition-colors hover:bg-muted hover:text-foreground"
            >
              View all
              <HugeiconsIcon
                icon={ArrowRight02Icon}
                strokeWidth={2}
                className="size-3"
              />
            </Link>
          </div>
          <div className="divide-y">
            {recentActivity.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
                <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-muted">
                  <HugeiconsIcon
                    icon={CheckmarkCircle02Icon}
                    strokeWidth={1.8}
                    className="size-5 text-muted-foreground"
                  />
                </div>
                <p className="font-medium text-muted-foreground text-sm">
                  No recent activity
                </p>
                <p className="mt-0.5 text-muted-foreground/70 text-xs">
                  Events will appear here as they happen.
                </p>
              </div>
            ) : (
              recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="group flex items-start gap-3 px-5 py-3 transition-colors hover:bg-muted/40"
                >
                  <div
                    className={cn(
                      "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold uppercase",
                      getActionIcon(activity.action)
                    )}
                  >
                    {activity.actorName.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-snug">
                      <span className="font-medium">
                        {activity.actorName}
                      </span>{" "}
                      <span className="text-muted-foreground">
                        {getActionVerb(activity.action)}
                      </span>{" "}
                      <span className="font-medium capitalize">
                        {activity.entityType}
                      </span>
                    </p>
                    <p className="mt-0.5 truncate text-muted-foreground text-xs">
                      {activity.organizationName}
                    </p>
                  </div>
                  <span className="shrink-0 text-muted-foreground/70 text-[11px] tabular-nums">
                    {formatTimeAgo(activity.createdAt)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* System Health — narrower column */}
        <div className="overflow-hidden rounded-xl border bg-card md:col-span-2">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <div>
              <h3 className="font-semibold text-sm leading-none tracking-tight">
                System Health
              </h3>
              <p className="mt-1 text-muted-foreground text-xs">
                Infrastructure status
              </p>
            </div>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium text-[11px]",
                allOperational
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
              )}
            >
              <span
                className={cn(
                  "size-1.5 animate-pulse rounded-full",
                  allOperational ? "bg-emerald-500" : "bg-amber-500"
                )}
              />
              {allOperational
                ? "All systems operational"
                : `${degradedCount} issue${degradedCount > 1 ? "s" : ""}`}
            </span>
          </div>
          <div className="divide-y">
            {healthChecks.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between px-5 py-3"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      "size-2 rounded-full",
                      item.status === "operational"
                        ? "bg-emerald-500"
                        : item.status === "degraded"
                          ? "bg-amber-500"
                          : "bg-red-500"
                    )}
                  />
                  <span className="text-sm">{item.label}</span>
                </div>
                <span
                  className={cn(
                    "font-medium text-xs capitalize",
                    item.status === "operational"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : item.status === "degraded"
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-red-600 dark:text-red-400"
                  )}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminDashboardShell>
  )
}
