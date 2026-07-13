"use client"

import { Button } from "@workspace/ui/components/button"
import { CardTitle } from "@workspace/ui/components/card"
import { Progress } from "@workspace/ui/components/progress"
import Link from "next/link"
import { formatCurrency } from "@/lib/format"
import type { ProjectDashboardResponse } from "@/lib/types"

export function ProjectsSection({
  projects,
}: {
  projects: ProjectDashboardResponse[]
}) {
  return (
    <section>
      <div className="mb-2 flex flex-row items-start justify-between gap-4">
        <CardTitle>Active projects</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link href="/dashboard/projects" />}
        >
          View all
        </Button>
      </div>
      <div>
        {projects.length ? (
          <div className="divide-y rounded-xl border">
            {projects.map((project) => (
              <ProjectRow key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed p-8 text-center">
            <p className="font-medium">No projects yet</p>
            <p className="mt-1 text-muted-foreground text-xs">
              Create your first project to start tracking its budget.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

function ProjectRow({ project }: { project: ProjectDashboardResponse }) {
  return (
    <div className="grid gap-4 p-4 transition-colors hover:bg-muted/35 lg:grid-cols-[minmax(12rem,1.3fr)_minmax(15rem,1.5fr)_auto] lg:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/dashboard/projects/${project.id}`}
            className="truncate font-semibold hover:text-primary"
          >
            {project.name}
          </Link>
        </div>
        <p className="mt-1 text-[10px] text-muted-foreground">
          {project.location}
        </p>
      </div>
      <div>
        <div className="mb-2 flex justify-between gap-4 text-xs">
          <span className="text-muted-foreground">Budget used</span>
          <span className="font-semibold">{Math.round(project.pct)}%</span>
        </div>
        <Progress value={Math.min(Math.max(project.pct, 0), 100)} />
        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[10px] text-muted-foreground">
          <span>{formatCurrency(project.spent)} spent</span>
          <span>{formatCurrency(project.remaining)} left</span>
        </div>
      </div>
      <Link
        href={`/dashboard/projects/${project.id}`}
        className="font-semibold text-primary text-xs transition-colors hover:text-primary/75"
      >
        View project
      </Link>
    </div>
  )
}
