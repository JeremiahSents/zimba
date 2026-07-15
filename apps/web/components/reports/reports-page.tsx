import { Download01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@workspace/ui/components/button"
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
  const stats = [
    ["Budget utilization", formatPercent(average), "Average across projects"],
    [
      "Projects on track",
      `${data.projects.filter((project) => project.pct < 80).length} of ${data.projects.length}`,
      "Below risk threshold",
    ],
    ["Reports ready", String(data.projects.length), "Available to export"],
  ]
  return (
    <DashboardShell
      title="Reports"
      subtitle="Summarize budget performance and export project updates."
      dataSource={data.source}
    >
      <Card className="gap-0 py-0">
        <div className="grid grid-cols-2 md:grid-cols-3 [&>*:first-child]:col-span-2 md:[&>*:first-child]:col-span-1">
          {stats.map(([label, value, detail]) => (
            <div
              key={label}
              className="border-t p-4 first:border-t-0 even:border-l md:border-t-0 md:border-l md:p-5 md:first:border-l-0"
            >
              <p className="font-medium text-foreground text-xs">{label}</p>
              <p className="mt-5 font-heading font-semibold text-base text-foreground">
                {value}
              </p>
              <p className="mt-1 text-[10px] text-muted-foreground">{detail}</p>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <CardHeader className="flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <CardTitle>Project reports</CardTitle>
            <CardDescription>
              Budget performance and delivery status by project.
            </CardDescription>
          </div>
          <Button size="sm">
            <HugeiconsIcon icon={Download01Icon} strokeWidth={1.5} />
            Export report
          </Button>
        </CardHeader>
        <CardContent>
          <ReportsTable projects={data.projects} />
        </CardContent>
      </Card>
    </DashboardShell>
  )
}
