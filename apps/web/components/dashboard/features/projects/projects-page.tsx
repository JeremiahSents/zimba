import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  FolderKanbanIcon,
  MoneyBag02Icon,
  TaskDone01Icon,
} from "@hugeicons/core-free-icons"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Progress } from "@workspace/ui/components/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { formatCurrency, formatPercent } from "@/lib/zimba/format"
import type { DashboardOverviewData } from "@/lib/zimba/types"

const projectDetails: Record<
  number,
  { client: string; timeline: string; status: "On track" | "At risk" }
> = {
  1: {
    client: "Zimba Developments",
    timeline: "Jan – Nov 2026",
    status: "On track",
  },
  2: {
    client: "Lakeview Living",
    timeline: "Mar – Dec 2026",
    status: "On track",
  },
  3: {
    client: "Kira Commercial",
    timeline: "May 2026 – Feb 2027",
    status: "At risk",
  },
}

export function ProjectsPage({ data }: { data: DashboardOverviewData }) {
  const totalValue = data.projects.reduce(
    (sum, project) => sum + project.budget,
    0
  )
  const onTrack = data.projects.filter(
    (project) => projectDetails[project.id]?.status === "On track"
  ).length

  const stats = [
    {
      label: "Total projects",
      value: String(data.projects.length),
      detail: "Across the current portfolio",
      icon: FolderKanbanIcon,
    },
    {
      label: "On track",
      value: String(onTrack),
      detail: "Delivering within plan",
      icon: TaskDone01Icon,
    },
    {
      label: "Portfolio value",
      value: formatCurrency(totalValue),
      detail: "Total approved project budget",
      icon: MoneyBag02Icon,
    },
  ]

  return (
    <DashboardShell
      title="Projects"
      subtitle="See every project, its financial position, and delivery status."
      dataSource={data.source}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-lg font-semibold tracking-tight">
            Project portfolio
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your active construction work in one place.
          </p>
        </div>
        <Button size="sm">
          <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
          New project
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} tone="keylime">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <span className="grid size-9 place-items-center rounded-full bg-primary/10 text-primary">
                <HugeiconsIcon
                  icon={stat.icon}
                  strokeWidth={2}
                  className="size-4"
                />
              </span>
            </div>
            <p className="mt-5 font-heading text-2xl font-semibold tracking-tight">
              {stat.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{stat.detail}</p>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All projects</CardTitle>
          <CardDescription>
            Delivery status and financial progress across the portfolio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Timeline</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead className="min-w-44">Spend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.projects.map((project) => {
                const details = projectDetails[project.id] ?? {
                  client: "Private client",
                  timeline: "Timeline pending",
                  status: "On track" as const,
                }

                return (
                  <TableRow key={project.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                          <HugeiconsIcon
                            icon={FolderKanbanIcon}
                            strokeWidth={2}
                            className="size-4"
                          />
                        </span>
                        <div>
                          <p className="font-medium text-foreground">
                            {project.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {project.location} · {project.plot_size}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{details.client}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          details.status === "At risk"
                            ? "bg-warning-soft text-warning"
                            : "bg-success-soft text-success"
                        }
                      >
                        {details.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {details.timeline}
                    </TableCell>
                    <TableCell>{formatCurrency(project.budget)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Progress
                          value={project.pct}
                          className="w-24 shrink-0 [&_[data-slot=progress-track]]:h-2"
                        />
                        <div className="min-w-20">
                          <p className="text-xs font-medium">
                            {formatPercent(project.pct)}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {formatCurrency(project.spent)}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardShell>
  )
}
