import {
  CheckmarkCircle02Icon,
  ShieldKeyIcon,
  UserGroupIcon,
  UserIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { AdminDashboardShell } from "@/components/dashboard-shell"
import { StatCard } from "@/components/stat-card"
import { UserItem, UsersTable } from "@/components/users-table"
import { listPlatformUsers } from "@/core/users/service"

export default async function UsersPage() {
  const users = await listPlatformUsers()

  const tableData: UserItem[] = (users as UserItem[]).map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    emailVerified: u.emailVerified,
    image: u.image,
    platformRole: u.platformRole,
    primaryOrganization: u.primaryOrganization,
    organizationName: u.organizationName,
    createdAt: u.createdAt,
  }))

  const superAdminsCount = users.filter(
    (u) => u.platformRole === "super_admin"
  ).length
  const supportCount = users.filter((u) => u.platformRole === "support").length
  const standardUsersCount = users.filter((u) => !u.platformRole).length

  return (
    <AdminDashboardShell>
      {/* ── Subtitle header ── */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          Platform-wide user management, roles, and organization assignments.
        </p>
      </div>

      {/* ── Top user stats cards row with trend lines ── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={users.length}
          accent="blue"
          trend={{
            value: 15,
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
          title="Super Admins"
          value={superAdminsCount}
          accent="emerald"
          trend={{
            value: superAdminsCount,
            label: "platform admins",
            isPositive: true,
          }}
          icon={
            <HugeiconsIcon
              icon={ShieldKeyIcon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
          description="Full system control"
        />
        <StatCard
          title="Support Staff"
          value={supportCount}
          accent="amber"
          trend={{
            value: supportCount,
            label: "active support",
            isPositive: true,
          }}
          icon={
            <HugeiconsIcon
              icon={UserIcon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
          description="Support access role"
        />
        <StatCard
          title="Standard Users"
          value={standardUsersCount}
          accent="default"
          trend={{
            value: standardUsersCount,
            label: "tenant members",
            isPositive: true,
          }}
          icon={
            <HugeiconsIcon
              icon={CheckmarkCircle02Icon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
          description="Tenant organization members"
        />
      </div>

      {/* ── Real TanStack Table for Users ── */}
      <UsersTable data={tableData} />
    </AdminDashboardShell>
  )
}
