"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  FolderKanbanIcon,
  MoneyBag02Icon,
  TaskDone01Icon,
} from "@hugeicons/core-free-icons"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ProjectsTable } from "@/components/dashboard/features/projects/projects-table"
import { ProjectCreateSheet } from "@/components/dashboard/features/projects/project-create-sheet"
import { formatCurrency } from "@/lib/zimba/format"
import type { DashboardOverviewData } from "@/lib/zimba/types"

export const projectDetails = {
  1: {
    client: "Zimba Developments",
    timeline: "Jan – Nov 2026",
    status: "On track" as const,
  },
  2: {
    client: "Lakeview Living",
    timeline: "Mar – Dec 2026",
    status: "On track" as const,
  },
  3: {
    client: "Kira Commercial",
    timeline: "May 2026 – Feb 2027",
    status: "At risk" as const,
  },
}

export function ProjectsPage({ data }: { data: DashboardOverviewData }) {
  const [projects, setProjects] = useState(data.projects)
  const totalValue = projects.reduce(
    (sum, project) => sum + project.budget,
    0
  )
  const onTrack = projects.filter(
    (project) =>
      projectDetails[project.id as keyof typeof projectDetails]?.status ===
      "On track"
  ).length
  const stats = [
    {
      label: "Total projects",
      value: String(projects.length),
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
      <Card className="gap-0 py-0">
        <div className="grid md:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="border-t p-5 first:border-t-0 md:border-t-0 md:border-l md:first:border-l-0"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">
                  {stat.label}
                </p>
                <HugeiconsIcon
                  icon={stat.icon}
                  strokeWidth={1.5}
                  className="size-4 text-primary"
                />
              </div>
              <p className="mt-5 font-heading text-3xl font-semibold text-foreground">
                {stat.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {stat.detail}
              </p>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>All projects</CardTitle>
            <CardDescription>
              Delivery status and financial progress across the portfolio.
            </CardDescription>
          </div>
          <ProjectCreateSheet onCreated={(project) => setProjects((current) => [...current, { ...project, id: Date.now(), plot_size: null, spent: 0, remaining: project.budget, pct: 0 }])} />
        </CardHeader>
        <CardContent>
          <ProjectsTable projects={projects} details={projectDetails} />
        </CardContent>
      </Card>
    </DashboardShell>
  )
}
