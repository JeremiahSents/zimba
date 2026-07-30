import type {
  AdminOrgAnalyticsDto,
  AdminProjectSummaryDto,
  AdminSupplierWithStatsDto,
} from "@workspace/api"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  BanknoteIcon,
  FactoryIcon,
  Invoice01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"
import { StatCard } from "@/components/stat-card"
import { RecentExpensesTable } from "@/components/org-detail/recent-expenses-table"
import { SpendBarChart } from "@/components/org-detail/spend-bar-chart"
import { UtilizationAreaChart } from "@/components/org-detail/utilization-area-chart"
import { formatCompactCurrency } from "@/lib/format-currency"

type OrgStats = {
  totalSpendCents: number
  totalPaidCents: number
  expenseCount: number
  paymentCount: number
  memberCount: number
  projectCount: number
  supplierCount: number
}

type Member = {
  id: string
  role: string
  responsibility: string | null
  createdAt: Date
  user: { name: string; email: string; image?: string | null }
}

type Org = {
  id: string
  name: string
  currency: string
  members: Member[]
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

function toTitleCase(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, " ")
    .replace(/\b\p{L}/gu, (match) => match.toUpperCase())
}

/** Direction + magnitude of a 30-day window compared to the previous one. */
function trendFrom(current: number, previous: number) {
  if (current === 0 && previous === 0) return undefined
  const direction = current >= previous ? ("up" as const) : ("down" as const)
  const pct =
    previous > 0
      ? Math.round((Math.abs(current - previous) / previous) * 100)
      : 100
  return { direction, label: `${pct}% vs prev 30d` }
}

function createdRecently(items: { createdAt: Date | string }[]) {
  const cutoff = Date.now() - THIRTY_DAYS_MS
  return items.filter((item) => new Date(item.createdAt).getTime() >= cutoff)
    .length
}

export function OrgDetailOverviewTab({
  org,
  stats,
  projects,
  suppliers,
  analytics,
}: {
  org: Org
  stats: OrgStats
  projects: AdminProjectSummaryDto[]
  suppliers: AdminSupplierWithStatsDto[]
  analytics: AdminOrgAnalyticsDto
}) {
  const spendChart = projects
    .slice(0, 6)
    .reverse()
    .map((project) => ({
      month: toTitleCase(project.name),
      spentCents: project.spentCents,
      budgetCents: project.budgetCents,
    }))
  const utilizationChart = projects
    .slice(0, 6)
    .reverse()
    .map((project) => ({
      month: toTitleCase(project.name),
      utilization:
        project.budgetCents > 0
          ? Math.min(
              100,
              Math.round((project.spentCents / project.budgetCents) * 100)
            )
          : 0,
    }))

  const newMembers = createdRecently(org.members)
  const newProjectsAndSuppliers =
    createdRecently(projects) + createdRecently(suppliers)

  return (
    <div className="mt-4 flex flex-col gap-4">
      {/* ── Analytics header ── */}
      <section>
        <p className="mb-2 font-semibold text-[10px] text-primary uppercase tracking-[0.16em]">
          Organization analytics
        </p>
      </section>

      {/* ── Financial & Platform Stats ── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          title="Total Spend"
          value={formatCompactCurrency(stats.totalSpendCents, org.currency)}
          icon={
            <HugeiconsIcon
              icon={BanknoteIcon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
          trend={trendFrom(
            analytics.trend.spendCurrentCents,
            analytics.trend.spendPreviousCents
          )}
          description={`${stats.expenseCount} receipts logged`}
        />
        <StatCard
          title="Total Paid"
          value={formatCompactCurrency(stats.totalPaidCents, org.currency)}
          icon={
            <HugeiconsIcon
              icon={Invoice01Icon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
          trend={trendFrom(
            analytics.trend.paidCurrentCents,
            analytics.trend.paidPreviousCents
          )}
          description={`${stats.paymentCount} completed payments`}
        />
        <StatCard
          title="Team Members"
          value={stats.memberCount}
          icon={
            <HugeiconsIcon
              icon={UserGroupIcon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
          trend={
            newMembers > 0
              ? { direction: "up", label: `+${newMembers} in 30d` }
              : undefined
          }
          description={`${org.members.length} registered members`}
        />
        <StatCard
          title="Projects & Suppliers"
          value={`${stats.projectCount} / ${stats.supplierCount}`}
          icon={
            <HugeiconsIcon
              icon={FactoryIcon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
          trend={
            newProjectsAndSuppliers > 0
              ? { direction: "up", label: `+${newProjectsAndSuppliers} in 30d` }
              : undefined
          }
          description={`${stats.projectCount} projects · ${stats.supplierCount} suppliers`}
        />
      </div>

      {/* ── Charts ── */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SpendBarChart data={spendChart} currency={org.currency} />
        </div>
        <UtilizationAreaChart data={utilizationChart} />
      </div>

      {/* ── Recent expenses ── */}
      <RecentExpensesTable
        expenses={analytics.recentExpenses}
        currency={org.currency}
        title="Recent expenses"
      />
    </div>
  )
}
