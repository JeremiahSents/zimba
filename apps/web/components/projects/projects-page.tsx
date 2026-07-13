"use client"

import {
  FolderKanbanIcon,
  MoneyBag02Icon,
  TaskDone01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import Link from "next/link"
import { useEffect, useState } from "react"
import { ProjectsTable } from "@/components/projects/projects-table"
import { DashboardShell } from "@/components/shared/dashboard-shell"
import { mockProjectListDetails } from "@/lib/api/mock-data"
import { formatCurrency } from "@/lib/format"
import { mergeStoredProjects } from "@/lib/project-store"
import type { DashboardOverviewData } from "@/lib/types"

export function ProjectsPage({ data }: { data: DashboardOverviewData }) {
  const [projects, setProjects] = useState(data.projects)
  useEffect(() => {
    const sync = () => setProjects(mergeStoredProjects(data.projects))
    sync()
    window.addEventListener("zimba-projects-updated", sync)
    return () => window.removeEventListener("zimba-projects-updated", sync)
  }, [data.projects])
  const totalValue = projects.reduce((sum, project) => sum + project.budget, 0)
  const onTrack = projects.filter(
    (project) =>
      mockProjectListDetails[project.id as keyof typeof mockProjectListDetails]
        ?.status === "On track"
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
                <p className="font-medium text-foreground text-xs">
                  {stat.label}
                </p>
                <HugeiconsIcon
                  icon={stat.icon}
                  strokeWidth={1.5}
                  className="size-4 text-primary"
                />
              </div>
              <p className="mt-5 font-heading font-semibold text-base text-foreground">
                {stat.value}
              </p>
              <p className="mt-1 text-[10px] text-muted-foreground">
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
          <Button
            size="sm"
            nativeButton={false}
            render={<Link href="/dashboard/projects/new" />}
          >
            + New project
          </Button>
        </CardHeader>
        <CardContent>
          <ProjectsTable projects={projects} details={mockProjectListDetails} />
        </CardContent>
      </Card>
    </DashboardShell>
  )
}
