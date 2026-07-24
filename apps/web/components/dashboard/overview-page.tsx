"use client"

import {
  Building01Icon,
  FolderKanbanIcon,
  MoneyBag02Icon,
  PlusSignIcon,
  Wallet02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@workspace/ui/components/button"
import { Card } from "@workspace/ui/components/card"
import Link from "next/link"

import { ProjectsSection } from "@/components/dashboard/projects-section"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { DashboardShell } from "@/components/shared/dashboard-shell"
import { useWorkspaceSlug } from "@/components/shared/use-workspace-slug"
import { formatCurrency } from "@/lib/format"
import type { DashboardOverviewData } from "@/lib/types"

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

export function DashboardPage({ data }: { data: DashboardOverviewData }) {
  const slug = useWorkspaceSlug()
  const projects = data.projects

  if (projects.length === 0) {
    return (
      <DashboardShell title="Home" headerGreeting={getGreeting()} subtitle="">
        <FirstProjectEmptyState slug={slug} />
      </DashboardShell>
    )
  }

  const totalBudget = projects.reduce((sum, project) => sum + project.budget, 0)
  const totalSpent = projects.reduce((sum, project) => sum + project.spent, 0)
  const stats = [
    {
      label: "Active projects",
      value: String(projects.length),
      icon: FolderKanbanIcon,
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
    <DashboardShell title="Home" headerGreeting={getGreeting()} subtitle="">
      <section className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <h2 className="font-heading font-semibold text-base text-foreground tracking-tight">
          Overview
        </h2>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            nativeButton={false}
            render={<Link href={`/${slug}/projects/new`} />}
          >
            <HugeiconsIcon icon={FolderKanbanIcon} strokeWidth={2} />
            New project
          </Button>
        </div>
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

      <ProjectsSection projects={projects} />
      <RecentActivity expenses={data.expenses.slice(0, 4)} />
    </DashboardShell>
  )
}

function FirstProjectEmptyState({ slug }: { slug: string }) {
  return (
    <section className="relative isolate flex min-h-[20rem] items-center justify-center overflow-hidden rounded-2xl px-6 py-12 text-center sm:min-h-[28rem] sm:px-10 sm:py-16">
      <div aria-hidden className="absolute inset-0 -z-20 opacity-45" />
      <div
        aria-hidden
        className="absolute top-0 left-1/2 -z-10 h-64 w-[36rem] -translate-x-1/2 rounded-full"
      />

      <div className="flex flex-col items-center gap-8">
        <div className="relative flex size-20 items-center justify-center">
          <HugeiconsIcon
            icon={Building01Icon}
            strokeWidth={1.45}
            className="size-9 text-primary"
          />
        </div>

        <Button
          className="min-w-40"
          size="lg"
          nativeButton={false}
          render={<Link href={`/${slug}/projects/new`} />}
        >
          <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
          Create project
        </Button>
      </div>
    </section>
  )
}
