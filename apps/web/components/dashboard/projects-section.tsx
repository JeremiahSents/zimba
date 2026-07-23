"use client"

import { Building01Icon, Location01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@workspace/ui/components/button"
import { Progress } from "@workspace/ui/components/progress"
import Link from "next/link"
import { useWorkspaceSlug } from "@/components/shared/use-workspace-slug"
import { formatCurrency } from "@/lib/format"
import type { ProjectDashboardResponse } from "@/lib/types"

export function ProjectsSection({
  projects,
}: {
  projects: ProjectDashboardResponse[]
}) {
  const slug = useWorkspaceSlug()
  return (
    <section>
      <div className="mb-4 flex flex-row items-center justify-between gap-3">
        <h2 className="font-heading font-semibold text-base text-foreground tracking-tight">
          Active projects
        </h2>
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link href={`/${slug}/projects`} />}
        >
          View all
        </Button>
      </div>
      <ProjectsList projects={projects} />
    </section>
  )
}

export function ProjectsList({
  projects,
  emptyTitle = "No projects yet",
  emptyDescription = "Create your first project to start tracking its budget.",
}: {
  projects: ProjectDashboardResponse[]
  emptyTitle?: string
  emptyDescription?: string
}) {
  return projects.length ? (
    <div className="flex flex-col gap-4">
      {projects.map((project) => (
        <ProjectRow key={project.id} project={project} />
      ))}
    </div>
  ) : (
    <div className="rounded-xl border border-dashed p-8 text-center">
      <p className="font-medium">{emptyTitle}</p>
      <p className="mt-1 text-muted-foreground text-xs">{emptyDescription}</p>
    </div>
  )
}

export function ProjectRow({ project }: { project: ProjectDashboardResponse }) {
  const budgetTone =
    project.pct >= 80 ? "critical" : project.pct >= 60 ? "warning" : "healthy"
  const utilizationPercent = Math.min(Math.max(project.pct, 0), 100)
  const budgetStatus =
    budgetTone === "critical"
      ? "Budget critical"
      : budgetTone === "warning"
        ? "Budget watch"
        : "Budget on track"
  const toneClasses =
    budgetTone === "critical"
      ? {
          pill: "bg-red-50 text-red-600",
          progress: "[&_[data-slot=progress-indicator]]:bg-red-500",
        }
      : budgetTone === "warning"
        ? {
            pill: "bg-amber-50 text-amber-600",
            progress: "[&_[data-slot=progress-indicator]]:bg-amber-500",
          }
        : {
            pill: "bg-green-50 text-green-600",
            progress: "[&_[data-slot=progress-indicator]]:bg-green-500",
          }

  return (
    <div className="grid gap-4 rounded-xl border bg-card p-5 shadow-sm transition-colors hover:bg-muted/35 lg:grid-cols-[minmax(12rem,1.1fr)_minmax(15rem,1.5fr)] lg:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <HugeiconsIcon
            icon={Building01Icon}
            strokeWidth={1.8}
            className="size-4 shrink-0 text-primary"
          />
          <Link
            href={`/admin/projects/${project.id}`}
            className="truncate font-semibold text-sm hover:text-primary"
          >
            {project.name}
          </Link>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground text-xs">
          <span className="inline-flex items-center gap-1">
            <HugeiconsIcon icon={Location01Icon} className="size-3.5" />
            {project.location}
          </span>
          {project.plot_size && <span>{project.plot_size}</span>}
        </div>
        <p
          className={`mt-2 inline-flex rounded-full px-2 py-0.5 font-medium text-[10px] ${toneClasses.pill}`}
        >
          {budgetStatus}
        </p>
      </div>
      <div>
        <div className="mb-2 flex justify-between gap-4 text-xs">
          <span className="text-muted-foreground">Budget utilized</span>
          <span
            className={`rounded-full px-2 py-0.5 font-semibold text-[10px] ${toneClasses.pill}`}
          >
            {Math.round(project.pct)}%
          </span>
        </div>
        <Progress value={utilizationPercent} className={toneClasses.progress} />
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-muted-foreground">
          <span>{formatCurrency(project.spent)} spent</span>
          <span>{formatCurrency(project.remaining)} left</span>
        </div>
      </div>
    </div>
  )
}
