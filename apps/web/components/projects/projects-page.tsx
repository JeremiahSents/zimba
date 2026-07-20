"use client"

import {
  ArchiveRestoreIcon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Delete02Icon,
  FolderKanbanIcon,
  MoneyBag02Icon,
  PlusSignIcon,
  Search01Icon,
  TaskDone01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@workspace/ui/components/button"
import { Card } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import {
  deleteProjectAction,
  restoreProjectAction,
} from "@/app/admin/projects/actions"
import { ProjectsList } from "@/components/dashboard/projects-section"
import { DashboardShell } from "@/components/shared/dashboard-shell"
import { formatCurrency } from "@/lib/format"
import type {
  DashboardOverviewData,
  ProjectDashboardResponse,
} from "@/lib/types"

const PAGE_SIZE = 5

export function ProjectsPage({
  data,
  archivedProjects,
}: {
  data: DashboardOverviewData
  archivedProjects: ProjectDashboardResponse[]
}) {
  const projects = data.projects
  const [search, setSearch] = useState("")
  const [pageIndex, setPageIndex] = useState(0)

  const totalValue = projects.reduce((sum, project) => sum + project.budget, 0)
  const onTrack = projects.filter(
    (project) => project.status === "on_track" || !project.status
  ).length
  const normalizedSearch = search.trim().toLowerCase()
  const filteredProjects = projects.filter((project) => {
    return [
      project.name,
      project.location,
      project.plot_size,
      project.client_name,
      project.status,
      project.building_type,
    ].some((value) => value?.toLowerCase().includes(normalizedSearch))
  })
  const pageCount = Math.max(Math.ceil(filteredProjects.length / PAGE_SIZE), 1)
  const safePageIndex = Math.min(pageIndex, pageCount - 1)
  const visibleProjects = filteredProjects.slice(
    safePageIndex * PAGE_SIZE,
    (safePageIndex + 1) * PAGE_SIZE
  )
  const stats = [
    {
      label: "Total projects",
      value: String(projects.length),
      icon: FolderKanbanIcon,
    },
    {
      label: "On track",
      value: String(onTrack),
      icon: TaskDone01Icon,
    },
    {
      label: "Portfolio value",
      value: formatCurrency(totalValue),
      icon: MoneyBag02Icon,
    },
  ]

  return (
    <DashboardShell
      title="Projects"
      subtitle="See every project, its financial position, and delivery status."
    >
      <section className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <h2 className="font-heading font-semibold text-base text-foreground tracking-tight">
          Overview
        </h2>
        <Button
          variant="secondary"
          size="sm"
          nativeButton={false}
          render={<Link href="/admin/projects/new" />}
        >
          <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
          New project
        </Button>
      </section>

      <div className="-mt-2 grid grid-cols-2 gap-3 lg:grid-cols-3">
        {stats.map((stat, index) => (
          <Card
            key={stat.label}
            className={`gap-0 py-0 ${index === 0 ? "col-span-2 lg:col-span-1" : ""}`}
          >
            <div className="p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-muted-foreground text-xs">
                  {stat.label}
                </p>
                <HugeiconsIcon
                  icon={stat.icon}
                  strokeWidth={1.7}
                  className="size-4 text-primary"
                />
              </div>
              <p className="mt-2 break-words font-heading font-semibold text-lg tracking-tight sm:text-xl">
                {stat.value}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <section>
        <div className="mb-4">
          <h2 className="font-heading font-semibold text-base text-foreground tracking-tight">
            All projects
          </h2>
          <p className="mt-1 text-muted-foreground text-xs">
            Delivery status and financial progress across the portfolio.
          </p>
        </div>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-xs">
            <HugeiconsIcon
              icon={Search01Icon}
              strokeWidth={1.5}
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPageIndex(0)
              }}
              placeholder="Search projects..."
              aria-label="Search projects"
              className="pl-9"
            />
          </div>
          <p className="text-muted-foreground text-xs">
            {filteredProjects.length}{" "}
            {filteredProjects.length === 1 ? "project" : "projects"}
          </p>
        </div>

        <ProjectsList
          projects={visibleProjects}
          emptyTitle="No matching projects"
          emptyDescription="Try a different project name, location, or client."
        />

        <div className="mt-5 flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground text-xs">
            Page {safePageIndex + 1} of {pageCount}
          </p>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                setPageIndex((current) => Math.max(current - 1, 0))
              }
              disabled={safePageIndex === 0}
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={1.5} />
              Previous
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() =>
                setPageIndex((current) => Math.min(current + 1, pageCount - 1))
              }
              disabled={safePageIndex >= pageCount - 1}
            >
              Next
              <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={1.5} />
            </Button>
          </div>
        </div>
      </section>

      <ArchivedProjectsSection projects={archivedProjects} />
    </DashboardShell>
  )
}

function ArchivedProjectsSection({
  projects,
}: {
  projects: ProjectDashboardResponse[]
}) {
  const router = useRouter()
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()

  if (projects.length === 0) return null

  function restoreProject(project: ProjectDashboardResponse) {
    setError("")
    setPendingId(project.id)
    startTransition(async () => {
      const result = await restoreProjectAction(project.id)
      setPendingId(null)
      if (!result.success) {
        setError(result.error.message)
        return
      }
      router.refresh()
    })
  }

  function deleteProject(project: ProjectDashboardResponse) {
    if (
      !window.confirm(
        `Delete ${project.name}? This permanently removes the archived project and connected records.`
      )
    ) {
      return
    }
    setError("")
    setPendingId(project.id)
    startTransition(async () => {
      const result = await deleteProjectAction(project.id)
      setPendingId(null)
      if (!result.success) {
        setError(result.error.message)
        return
      }
      router.refresh()
    })
  }

  return (
    <section>
      <div className="mb-4">
        <h2 className="font-heading font-semibold text-base text-foreground tracking-tight">
          Archived projects
        </h2>
        <p className="mt-1 text-muted-foreground text-xs">
          Restore a project to active work or remove it permanently.
        </p>
      </div>
      {error && (
        <p className="mb-3 rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-destructive text-xs">
          {error}
        </p>
      )}
      <div className="divide-y rounded-xl border bg-card">
        {projects.map((project) => {
          const disabled = isPending && pendingId === project.id
          return (
            <div
              key={project.id}
              className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
            >
              <div className="min-w-0">
                <Link
                  href={`/admin/projects/${project.id}`}
                  className="block truncate font-semibold text-sm hover:text-primary"
                >
                  {project.name}
                </Link>
                <p className="mt-1 truncate text-muted-foreground text-xs">
                  {project.location} - {formatCurrency(project.budget)}
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="icon-sm"
                  onClick={() => restoreProject(project)}
                  disabled={disabled}
                  aria-label={`Restore ${project.name}`}
                  title="Restore"
                >
                  <HugeiconsIcon icon={ArchiveRestoreIcon} strokeWidth={1.8} />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => deleteProject(project)}
                  disabled={disabled}
                  aria-label={`Delete ${project.name}`}
                  title="Delete"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <HugeiconsIcon icon={Delete02Icon} strokeWidth={1.8} />
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
