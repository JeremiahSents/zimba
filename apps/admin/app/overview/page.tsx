import { AdminDashboardShell } from "../../components/dashboard-shell"
import { StatCard } from "../../components/stat-card"
import { getPlatformSession } from "../../core/auth/service"
import { getPlatformStats } from "../../core/services/platform"
import { getRecentActivity } from "../../core/services/activity"
import { getSystemHealth } from "../../core/services/system"
import {
  BanknoteIcon,
  Building03Icon,
  FactoryIcon,
  Invoice01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Card } from "@workspace/ui/components/card"

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

export default async function OverviewPage() {
  const [stats, session, recentActivity, healthChecks] = await Promise.all([
    getPlatformStats(),
    getPlatformSession(),
    getRecentActivity(5),
    getSystemHealth(),
  ])

  const userName = session?.user.name ?? "Admin"
  const userImage = session?.user.image ?? null

  const statItems = [
    {
      label: "Total Organizations",
      value: stats.totalOrganizations,
      icon: Building03Icon,
      description: `${stats.activeOrganizations} active`,
    },
    { label: "Total Users", value: stats.totalUsers, icon: UserGroupIcon },
    { label: "Total Receipts", value: stats.totalReceipts, icon: Invoice01Icon },
    { label: "Total Projects", value: stats.totalProjects, icon: FactoryIcon },
    { label: "Total Payments", value: stats.totalPayments, icon: BanknoteIcon },
  ]


  return (
    <AdminDashboardShell
      title="Overview"
      headerGreeting={getGreeting()}
      userName={userName}
      userImage={userImage}
    >
      <section className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <h2 className="font-heading font-semibold text-base text-foreground tracking-tight">
          Overview
        </h2>
      </section>

      <div className="-mt-2 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statItems.map((stat, index) => (
          <StatCard
            key={stat.label}
            title={stat.label}
            value={stat.value}
            icon={
              <HugeiconsIcon
                icon={stat.icon}
                strokeWidth={1.7}
                className="size-4 text-primary"
              />
            }
            description={stat.description}
            className={index === 0 ? "col-span-2 lg:col-span-1" : undefined}
          />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="font-semibold leading-none tracking-tight">
            Recent Activity
          </h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Latest events across the platform.
          </p>
          <div className="space-y-4">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity.</p>
            ) : (
              recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="text-sm border-b border-border pb-2 last:border-0 last:pb-0"
                >
                  <span className="font-medium">{activity.actorName}</span>{" "}
                  <span className="text-muted-foreground">performed</span>{" "}
                  <span className="font-medium">{activity.action}</span>{" "}
                  <span className="text-muted-foreground">on</span>{" "}
                  <span className="capitalize">{activity.entityType}</span>{" "}
                  <span className="text-muted-foreground">in {activity.organizationName}</span>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold leading-none tracking-tight mb-4">
            System Health
          </h3>
          <div className="space-y-4">
            {healthChecks.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between text-sm"
              >
                <span>{item.label}</span>
                <span
                  className={
                    item.status === "operational"
                      ? "text-emerald-500 font-medium capitalize"
                      : item.status === "degraded"
                        ? "text-amber-500 font-medium capitalize"
                        : "text-red-500 font-medium capitalize"
                  }
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AdminDashboardShell>
  )
}
