import type { ProjectDashboardResponse } from "@/lib/types"

const STORAGE_KEY = "zimba-projects"

export function readStoredProjects(): ProjectDashboardResponse[] {
  if (typeof window === "undefined") return []
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    return value ? (JSON.parse(value) as ProjectDashboardResponse[]) : []
  } catch {
    return []
  }
}

export function storeProject(project: ProjectDashboardResponse) {
  const projects = readStoredProjects().filter((item) => item.id !== project.id)
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...projects, project]))
  window.dispatchEvent(new Event("zimba-projects-updated"))
}

export function mergeStoredProjects(projects: ProjectDashboardResponse[]) {
  const stored = readStoredProjects()
  return [...projects.filter((project) => !stored.some((item) => item.id === project.id)), ...stored]
}
