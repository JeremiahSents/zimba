"use client"

import {
  Analytics02Icon,
  FolderKanbanIcon,
  Invoice02Icon,
  MoneyBag02Icon,
  Wallet02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@workspace/ui/components/button"
import { Card } from "@workspace/ui/components/card"
import Link from "next/link"
import { useEffect, useState } from "react"

import { ProjectsSection } from "@/components/dashboard/projects-section"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { DashboardShell } from "@/components/shared/dashboard-shell"
import { getAttentionItems } from "@/lib/dashboard-home"
import { formatCurrency } from "@/lib/format"
import { mergeStoredProjects } from "@/lib/project-store"
import type { DashboardOverviewData } from "@/lib/types"

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
          <h2 className="font-heading font-semibold text-foreground text-xl tracking-tight">
            Good morning, Musa
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            nativeButton={false}
            render={<Link href="/dashboard/expenses" />}
          >
            <HugeiconsIcon icon={Invoice02Icon} strokeWidth={2} />
            Add expense
          </Button>
          <Button
            size="sm"
            nativeButton={false}
            render={<Link href="/dashboard/projects/new" />}
          >
            + New project
          </Button>
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
                <p className="font-medium text-muted-foreground text-xs">
                  {stat.label}
                </p>
                <HugeiconsIcon
                  icon={stat.icon}
                  strokeWidth={1.7}
                  className="size-4 text-primary"
                />
              </div>
              <p className="mt-4 font-heading font-semibold text-base tracking-tight">
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
