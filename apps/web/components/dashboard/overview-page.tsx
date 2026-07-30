"use client"

import {
  FolderKanbanIcon,
  MoneyBag02Icon,
  PlusSignIcon,
  Wallet02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@workspace/ui/components/button"
import { Card } from "@workspace/ui/components/card"
import {
  EmptyState,
  EmptyStateCards,
} from "@workspace/ui/components/empty-state"
import Link from "next/link"

import { ProjectsSection } from "@/components/dashboard/projects-section"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { DashboardShell } from "@/components/shared/dashboard-shell"
import { useWorkspaceSlug } from "@/components/shared/use-workspace-slug"
import { useWorkspace } from "@/components/shared/workspace-context"
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
  const user = useWorkspace()
  const projects = data.projects
  const firstName = user.name.trim().split(/\s+/)[0]

  if (projects.length === 0) {
    return (
      <DashboardShell>
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
    <DashboardShell
      title="Command Center"
      description={`${getGreeting()}${firstName ? `, ${firstName}` : ""} — what's on budget, what's drifting, and where the money went.`}
      action={
        <Button
          size="sm"
          nativeButton={false}
          render={<Link href={`/${slug}/projects/new`} />}
        >
          <HugeiconsIcon icon={FolderKanbanIcon} strokeWidth={2} />
          New project
        </Button>
      }
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
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
    <EmptyState
      title="Start your first project"
      description="Track budgets, receipts and supplier payments in one place. Create a project and the dashboard fills in from there."
      preview={<EmptyStateCards />}
      action={
        <Button
          className="min-w-40"
          size="lg"
          nativeButton={false}
          render={<Link href={`/${slug}/projects/new`} />}
        >
          <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
          Create project
        </Button>
      }
    />
  )
}
