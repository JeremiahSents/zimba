import {
  getAdminProjectDetailUseCase,
  getOrganizationDetailUseCase,
  type AdminProjectDetailDto,
} from "@workspace/api"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  BanknoteIcon,
  ChartBarIncreasingIcon,
  Coins01Icon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons"
import { notFound } from "next/navigation"
import { AdminDashboardShell } from "@/components/dashboard-shell"
import { BreadcrumbSetter } from "@/components/breadcrumb-context"
import { BudgetItemsTable } from "@/components/org-detail/budget-items-table"
import { ProjectPaymentsTable } from "@/components/org-detail/project-payments-table"
import { ProjectReceiptsTable } from "@/components/org-detail/project-receipts-table"
import { StatCard } from "@/components/stat-card"
import { StatusBadge } from "@/components/status-badge"
import { formatCompactCurrency } from "@/lib/format-currency"

function getOrdinalSuffix(day: number): string {
  if (day > 3 && day < 21) return "th"
  switch (day % 10) {
    case 1:
      return "st"
    case 2:
      return "nd"
    case 3:
      return "rd"
    default:
      return "th"
  }
}

function formatDate(dateInput: Date | string) {
  const d = new Date(dateInput)
  const day = d.getDate()
  const month = d.toLocaleDateString("en-US", { month: "long" })
  const year = d.getFullYear()
  return `${day}${getOrdinalSuffix(day)} ${month}, ${year}`
}

function toTitleCase(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, " ")
    .replace(/\b\p{L}/gu, (match) => match.toUpperCase())
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string; projectId: string }>
}) {
  const { id: organizationId, projectId } = await params

  let project: AdminProjectDetailDto
  let orgName: string
  try {
    ;[project, orgName] = await Promise.all([
      getAdminProjectDetailUseCase(organizationId, projectId),
      getOrganizationDetailUseCase(organizationId).then((o) => o?.name ?? "Organization"),
    ])
  } catch {
    notFound()
  }

  const totalBudget = project.budgetItems.reduce(
    (sum, i) => sum + i.budgetCents,
    0
  )
  const totalSpent = project.budgetItems.reduce(
    (sum, i) => sum + i.spentCents,
    0
  )
  const remaining = totalBudget - totalSpent
  const overallPct =
    totalBudget > 0
      ? Math.min(100, Math.round((totalSpent / totalBudget) * 100))
      : 0

  return (
    <>
      <BreadcrumbSetter
        items={[
          { label: "Organizations", href: "/organizations" },
          { label: orgName, href: `/organizations/${organizationId}` },
          { label: "Projects", href: `/organizations/${organizationId}?tab=projects` },
          { label: toTitleCase(project.name) },
        ]}
      />
      <AdminDashboardShell
        title={
          <span className="flex flex-wrap items-center gap-2.5">
            {toTitleCase(project.name)}
            <StatusBadge status={project.status} />
          </span>
        }
        description={`Created ${formatDate(project.createdAt)}`}
      >
      <div className="mt-4 flex flex-col gap-4">
        {/* ── Budget analytics header ── */}
        <section>
          <p className="mb-2 font-semibold text-[10px] text-primary uppercase tracking-[0.16em]">
            Budget analytics
          </p>
        </section>

        {/* ── Budget overview stats ── */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            title="Total Budget"
            value={formatCompactCurrency(totalBudget, project.currency)}
            icon={
              <HugeiconsIcon
                icon={BanknoteIcon}
                strokeWidth={1.7}
                className="size-4"
              />
            }
            description={`${project.budgetItems.length} line items`}
          />
          <StatCard
            title="Total Spent"
            value={formatCompactCurrency(totalSpent, project.currency)}
            icon={
              <HugeiconsIcon
                icon={Coins01Icon}
                strokeWidth={1.7}
                className="size-4"
              />
            }
            description={`${project.receipts.length} receipts logged`}
          />
          <StatCard
            title="Remaining"
            value={formatCompactCurrency(remaining, project.currency)}
            icon={
              <HugeiconsIcon
                icon={Wallet01Icon}
                strokeWidth={1.7}
                className="size-4"
              />
            }
            description={`${project.payments.length} payments recorded`}
          />
          <StatCard
            title="Utilization"
            value={`${overallPct}%`}
            icon={
              <HugeiconsIcon
                icon={ChartBarIncreasingIcon}
                strokeWidth={1.7}
                className="size-4"
              />
            }
            description="Budget consumed"
          />
        </div>

        {/* ── Budget items ── */}
        <BudgetItemsTable
          items={project.budgetItems}
          currency={project.currency}
          organizationId={organizationId}
          projectId={projectId}
          title="Budget items"
        />

        {/* ── Receipts ── */}
        <ProjectReceiptsTable
          receipts={project.receipts}
          currency={project.currency}
          title="Receipts"
        />

        {/* ── Payments ── */}
        <ProjectPaymentsTable
          payments={project.payments}
          organizationId={organizationId}
          title="Payments"
        />
      </div>
    </AdminDashboardShell>
    </>
  )
}
