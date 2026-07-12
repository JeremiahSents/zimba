"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Analytics02Icon,
  FolderKanbanIcon,
  Invoice02Icon,
  MoneyBag02Icon,
  Wallet02Icon,
} from "@hugeicons/core-free-icons"

import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardTitle,
} from "@workspace/ui/components/card"
import { Progress } from "@workspace/ui/components/progress"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { mergeStoredProjects } from "@/lib/zimba/project-store"
import {
  getAttentionItems,
} from "@/lib/zimba/dashboard-home"
import { formatCurrency, formatShortDate } from "@/lib/zimba/format"
import type {
  DashboardOverviewData,
  ProjectDashboardResponse,
} from "@/lib/zimba/types"

export function DashboardPage({ data }: { data: DashboardOverviewData }) {
  const [projects, setProjects] = useState(data.projects)
  useEffect(() => {
    const sync = () => setProjects(mergeStoredProjects(data.projects))
    sync()
    window.addEventListener("zimba-projects-updated", sync)
    return () => window.removeEventListener("zimba-projects-updated", sync)
  }, [data.projects])
  const attentionItems = getAttentionItems(projects)
  const totalBudget = projects.reduce((sum, project) => sum + project.budget, 0)
  const totalSpent = projects.reduce((sum, project) => sum + project.spent, 0)
  const stats = [
    {
      label: "Active projects",
      value: String(projects.length),
      icon: FolderKanbanIcon,
    },
    {
      label: "Needs attention",
      value: String(attentionItems.length),
      icon: Analytics02Icon,
    },
    {
      label: "Total budget",
      value: formatCurrency(totalBudget),
      icon: Wallet02Icon,
    },
    {
      label: "Total spent",
      value: formatCurrency(totalSpent),
      icon: MoneyBag02Icon,
    },
  ]

  return (
    <DashboardShell title="Home" dataSource={data.source} subtitle="">
      <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-heading text-xl font-semibold tracking-tight text-foreground">
            Good morning, Musa
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" nativeButton={false} render={<Link href="/dashboard/expenses" />}>
            <HugeiconsIcon icon={Invoice02Icon} strokeWidth={2} />
            Add expense
          </Button>
          <Button size="sm" nativeButton={false} render={<Link href="/dashboard/projects/new" />}>+ New project</Button>
        </div>
      </section>

      <Card className="gap-0 py-0">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="border-t p-5 first:border-t-0 sm:nth-[2]:border-t-0 lg:border-t-0 lg:border-l lg:first:border-l-0"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-medium text-muted-foreground">
                  {stat.label}
                </p>
                <HugeiconsIcon
                  icon={stat.icon}
                  strokeWidth={1.7}
                  className="size-4 text-primary"
                />
              </div>
              <p className="mt-4 font-heading text-base font-semibold tracking-tight">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <ProjectsSection projects={projects} />
      <RecentActivity expenses={data.expenses.slice(0, 4)} />
    </DashboardShell>
  )
}

function ProjectsSection({ projects }: { projects: ProjectDashboardResponse[] }) {
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
            {projects.map((project) => {
              return (
                <div
                  key={project.id}
                  className="grid gap-4 p-4 transition-colors hover:bg-muted/35 lg:grid-cols-[minmax(12rem,1.3fr)_minmax(15rem,1.5fr)_auto] lg:items-center"
                >
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
                    className="text-xs font-semibold text-primary transition-colors hover:text-primary/75"
                  >
                    View project
                  </Link>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed p-8 text-center">
            <p className="font-medium">No projects yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Create your first project to start tracking its budget.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

function RecentActivity({
  expenses,
}: {
  expenses: DashboardOverviewData["expenses"]
}) {
  const activityIcons = [Invoice02Icon, MoneyBag02Icon, FolderKanbanIcon, Analytics02Icon]

  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-4">
        <h2 className="font-heading text-base font-semibold text-foreground">
          Recent activity
        </h2>
        <Link
          href="/dashboard/analytics"
          className="text-xs font-semibold text-primary transition-colors hover:text-primary/75"
        >
          View analytics
        </Link>
      </div>
        {expenses.length ? (
          <div className="divide-y">
            {expenses.map((expense, index) => (
              <div
                key={expense.id}
                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                <span className="grid size-8 shrink-0 place-items-center text-primary">
                  <HugeiconsIcon
                    icon={
                      activityIcons[index % activityIcons.length] ??
                      Invoice02Icon
                    }
                    strokeWidth={1.8}
                    className="size-4"
                  />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {expense.item_description}
                  </p>
                  <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                    {expense.project_name} · {expense.supplier_name}
                  </p>
                </div>
                <div className="ml-auto shrink-0 text-right">
                  <p className="text-sm font-semibold">
                    {formatCurrency(expense.amount)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatShortDate(expense.date)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-4 text-center text-xs text-muted-foreground">
            No activity yet.
          </p>
        )}
      <div className="mt-3 flex justify-center border-t pt-3">
        <Link
          href="/dashboard/analytics"
          className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
        >
          View more
        </Link>
      </div>
    </section>
  )
}
