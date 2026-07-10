import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Progress } from "@workspace/ui/components/progress"
import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { formatCurrency, formatPercent } from "@/lib/zimba/format"
import type { DashboardOverviewData } from "@/lib/zimba/types"

const reportFilters = ["Monthly", "Budget", "Suppliers", "Export-ready"]

export function ReportsPage({ data }: { data: DashboardOverviewData }) {
  const averageUtilization =
    data.projects.length > 0
      ? Math.round(
          data.projects.reduce((total, project) => total + project.pct, 0) /
            data.projects.length
        )
      : 0
  const projectsOnTrack = data.projects.filter((project) => project.pct < 80)
  const reviewProject =
    data.projects.find((project) => project.pct >= 45) ?? data.projects[0]

  return (
    <DashboardShell
      title="Reports"
      subtitle="Summarize budget performance and export project updates."
      dataSource={data.source}
    >
      <div className="flex items-center justify-between pb-4">
        <Tabs defaultValue={reportFilters[0]}>
          <TabsList>
            {reportFilters.map((filter) => (
              <TabsTrigger key={filter} value={filter}>
                {filter}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {data.projects.map((project) => (
          <Card key={project.id} tone="keylime">
            <CardHeader>
              <CardTitle>{project.name}</CardTitle>
              <CardDescription>
                {project.location} - {project.plot_size ?? "Plot size pending"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Budget</p>
                  <p className="font-semibold">
                    {formatCurrency(project.budget)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Remaining</p>
                  <p className="font-semibold">
                    {formatCurrency(project.remaining)}
                  </p>
                </div>
              </div>
              <Progress value={project.pct} />
              <Button variant="outline" className="w-full">
                Prepare report
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <ReportMetric
          detail="Current period"
          label="Budget utilization"
          value={formatPercent(averageUtilization)}
        />
        <ReportMetric
          detail="Below budget-risk threshold"
          label="Projects on track"
          value={`${projectsOnTrack.length} of ${data.projects.length}`}
        />
        <ReportMetric
          detail="Needs attention"
          label="Review required"
          value={reviewProject?.name ?? "None"}
        />
      </div>
    </DashboardShell>
  )
}

function ReportMetric({
  detail,
  label,
  value,
}: {
  detail: string
  label: string
  value: string
}) {
  return (
    <Card tone="mint">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="font-heading text-3xl font-medium text-primary">
          {value}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  )
}
