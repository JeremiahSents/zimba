import {
  BarChartIcon,
  CheckmarkCircle02Icon,
  FileCheckIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { ReportsTable } from "@/components/reports/reports-table"
import { DashboardShell } from "@/components/shared/dashboard-shell"
import { formatPercent } from "@/lib/format"
import type { DashboardOverviewData } from "@/lib/types"

export function ReportsPage({ data }: { data: DashboardOverviewData }) {
  const average = data.projects.length
    ? Math.round(
        data.projects.reduce((sum, project) => sum + project.pct, 0) /
          data.projects.length
      )
    : 0

  const onTrackCount = data.projects.filter((project) => project.pct < 80).length

  return (
    <DashboardShell
      title="Reports"
      subtitle="Summarize budget performance and export individual project reports."
    >
      {/* ── Top Summary Stats Grid ── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
              Budget Utilization
            </span>
            <span className="grid size-8 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600">
              <HugeiconsIcon icon={BarChartIcon} strokeWidth={1.8} className="size-4" />
            </span>
          </div>
          <p className="mt-3 font-heading font-semibold text-2xl text-foreground tabular-nums">
            {formatPercent(average)}
          </p>
          <p className="mt-1 text-muted-foreground text-xs">Average across projects</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
              Projects On Track
            </span>
            <span className="grid size-8 place-items-center rounded-lg bg-blue-500/10 text-blue-600">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={1.8} className="size-4" />
            </span>
          </div>
          <p className="mt-3 font-heading font-semibold text-2xl text-foreground tabular-nums">
            {onTrackCount} of {data.projects.length}
          </p>
          <p className="mt-1 text-muted-foreground text-xs">Below risk threshold</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
              Reports Ready
            </span>
            <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <HugeiconsIcon icon={FileCheckIcon} strokeWidth={1.8} className="size-4" />
            </span>
          </div>
          <p className="mt-3 font-heading font-semibold text-2xl text-foreground tabular-nums">
            {data.projects.length}
          </p>
          <p className="mt-1 text-muted-foreground text-xs">Available for PDF export</p>
        </div>
      </div>

      {/* ── Project Reports Table Card ── */}
      <Card className="rounded-xl border bg-card shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="font-heading font-semibold text-lg tracking-tight">
            Project Reports
          </CardTitle>
          <CardDescription className="text-muted-foreground text-xs">
            Budget performance and delivery status by project. Export individual PDF reports per project below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReportsTable projects={data.projects} />
        </CardContent>
      </Card>
    </DashboardShell>
  )
}
