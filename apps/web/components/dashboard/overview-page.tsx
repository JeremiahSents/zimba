"use client"

import {
  Analytics02Icon,
  FolderKanbanIcon,
  MoneyBag02Icon,
  Wallet02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Card } from "@workspace/ui/components/card"
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
      trend: "+12%",
      trendLabel: "from last month",
      trendTone: "positive",
    },
    {
      label: "Needs attention",
      value: String(attentionItems.length),
      icon: Analytics02Icon,
      trend: "-8%",
      trendLabel: "from last month",
      trendTone: "positive",
    },
    {
      label: "Total budget",
      value: formatCurrency(totalBudget),
      icon: Wallet02Icon,
      trend: "+5.4%",
      trendLabel: "from last month",
      trendTone: "positive",
    },
    {
      label: "Total spent",
      value: formatCurrency(totalSpent),
      icon: MoneyBag02Icon,
      trend: "+2.1%",
      trendLabel: "from last month",
      trendTone: "negative",
    },
  ]

  return (
    <DashboardShell
      title="Home"
      dataSource={data.source}
      headerGreeting="Good morning, Musa"
      subtitle=""
    >
      <section className="flex items-baseline justify-between gap-3">
        <h2 className="font-heading font-semibold text-base text-foreground tracking-tight">
          Overview
        </h2>
        <p className="text-muted-foreground text-xs">Last 30 days</p>
      </section>

      <Card className="-mt-4 gap-0 py-0">
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
                <span className="flex size-7 items-center justify-center rounded-md bg-primary/10">
                  <HugeiconsIcon
                    icon={stat.icon}
                    strokeWidth={1.7}
                    className="size-4 text-primary"
                  />
                </span>
              </div>
              <p className="mt-3 font-heading font-semibold text-2xl tracking-tight">
                {stat.value}
              </p>
              <p className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <span
                  className={
                    stat.trendTone === "positive"
                      ? "rounded-full bg-success-soft px-1.5 py-0.5 font-medium text-success"
                      : "rounded-full bg-destructive/10 px-1.5 py-0.5 font-medium text-destructive"
                  }
                >
                  {stat.trend}
                </span>
                {stat.trendLabel}
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
