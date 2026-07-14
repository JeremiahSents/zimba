import type { ProjectDashboardResponse } from "@/lib/types"

export type AttentionItem = {
  id: string
  title: string
  detail: string
  action: string
  href: string
}

export function getProjectHealth(project: ProjectDashboardResponse) {
  if (project.pct >= 100) {
    return { label: "Over budget", variant: "destructive" as const }
  }
  if (project.pct >= 80) {
    return { label: "At risk", variant: "warning" as const }
  }
  return { label: "On track", variant: "success" as const }
}

export function getAttentionItems(
  projects: ProjectDashboardResponse[]
): AttentionItem[] {
  if (projects.length === 0) {
    return [
      {
        id: "no-projects",
        title: "Create your first project",
        detail: "Set up a project before you start logging expenses.",
        action: "View projects",
        href: "/admin/projects",
      },
    ]
  }

  return projects
    .filter((project) => project.pct >= 80)
    .sort((a, b) => b.pct - a.pct)
    .map((project) => ({
      id: `budget-${project.id}`,
      title: `${project.name} needs a budget check`,
      detail: `${Math.round(project.pct)}% of the project budget has been used.`,
      action: "Review budget",
      href: `/admin/projects/${project.id}`,
    }))
}
