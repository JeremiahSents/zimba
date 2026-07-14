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
import { useWorkspace } from "@/components/shared/workspace-provider"
import { formatCurrency } from "@/lib/format"
import type { DashboardOverviewData } from "@/lib/types"

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

export function DashboardPage({ data }: { data: DashboardOverviewData }) {
  const user = useWorkspace()
  const firstName = user.name.trim().split(/\s+/)[0] || "there"
  const projects = data.projects

  if (projects.length === 0) {
    return (
      <DashboardShell
        title="Home"
        dataSource={data.source}
        headerGreeting={`${getGreeting()}, ${firstName}`}
        subtitle=""
      >
        <FirstProjectEmptyState />
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
    <DashboardShell
      title="Home"
      dataSource={data.source}
      headerGreeting={`${getGreeting()}, ${firstName}`}
      subtitle=""
    >
      <section className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <h2 className="font-heading font-semibold text-base text-foreground tracking-tight">
          Overview
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/admin/projects/new" />}
          >
            <HugeiconsIcon icon={FolderKanbanIcon} strokeWidth={2} />
            New project
          </Button>
          <Button
            size="sm"
            nativeButton={false}
            render={<Link href="/admin/expenses" />}
          >
            <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
            Add expense
          </Button>
        </div>
      </section>

      <div className="-mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="gap-0 py-0">
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
              <p className="mt-2 font-heading font-semibold text-xl tracking-tight">
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

function FirstProjectEmptyState() {
  return (
    <section className="relative isolate flex min-h-[28rem] items-center justify-center overflow-hidden rounded-2xl px-6 py-16 text-center sm:px-10">
      <div
        aria-hidden
        className="absolute inset-0 -z-20 opacity-45"
      />
      <div
        aria-hidden
        className="absolute top-0 left-1/2 -z-10 h-64 w-[36rem] -translate-x-1/2 rounded-full "
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
          render={<Link href="/admin/projects/new" />}
        >
          <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
          Create project
        </Button>
      </div>
    </section>
  )
}
