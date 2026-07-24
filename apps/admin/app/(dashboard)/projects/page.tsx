import {
  FactoryIcon,
  Invoice01Icon,
  Money01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { AdminDashboardShell } from "@/components/dashboard-shell"
import { ProjectItem, ProjectsTable } from "@/components/projects-table"
import { StatCard } from "@/components/stat-card"
import { listPlatformProjects } from "@/core/organizations/projects"
import { formatCompactCurrency } from "@/lib/format-currency"

export default async function ProjectsPage() {
  const projects = await listPlatformProjects()

  const tableData: ProjectItem[] = (projects as ProjectItem[]).map((p) => ({
    id: p.id,
    organizationId: p.organizationId,
    organizationName: p.organizationName,
    name: p.name,
    location: p.location,
    buildingType: p.buildingType,
    clientName: p.clientName,
    status: p.status,
    currency: p.currency,
    receiptCount: p.receiptCount,
    totalSpendCents: p.totalSpendCents,
    createdAt: p.createdAt,
  }))

  const activeCount = projects.filter((p) => p.status === "active").length
  const totalReceipts = projects.reduce((sum, p) => sum + p.receiptCount, 0)
  const totalSpendCents = projects.reduce(
    (sum, p) => sum + Number(p.totalSpendCents ?? 0),
    0
  )

  const primaryCurrency = projects[0]?.currency || "UGX"

  return (
    <AdminDashboardShell>
      {/* ── Subtitle header ── */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          Platform-wide project monitoring, financials, and location tracking.
        </p>
      </div>

      {/* ── Top Projects Stats Cards Row ── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          title="Total Projects"
          value={projects.length}
          accent="blue"
          trend={{
            value: 10,
            label: "vs last month",
            isPositive: true,
          }}
          icon={
            <HugeiconsIcon
              icon={FactoryIcon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
        />
        <StatCard
          title="Active Projects"
          value={activeCount}
          accent="emerald"
          trend={{
            value: activeCount,
            label: "currently active",
            isPositive: true,
          }}
          icon={
            <HugeiconsIcon
              icon={FactoryIcon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
          description={`${activeCount} of ${projects.length} active`}
        />
        <StatCard
          title="Total Receipts"
          value={totalReceipts}
          accent="default"
          icon={
            <HugeiconsIcon
              icon={Invoice01Icon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
          description="Logged expense receipts"
        />
        <StatCard
          title="Total Spend"
          value={formatCompactCurrency(totalSpendCents, primaryCurrency)}
          accent="emerald"
          icon={
            <HugeiconsIcon
              icon={Money01Icon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
          description="Across all platform projects"
        />
      </div>

      {/* ── Real TanStack Table for Projects ── */}
      <ProjectsTable data={tableData} />
    </AdminDashboardShell>
  )
}
