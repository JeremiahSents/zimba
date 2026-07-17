import "server-only"
import { requireSession } from "../auth/service"
import * as projectRepo from "./repository"
import * as allocationRepo from "../allocations/repository"
import { notFound } from "../shared/errors"
import type { ProjectDashboardResponse, ProjectDetailResponse } from "@/lib/types"

export async function getProjectsList() {
  const { organization } = await requireSession()
  const projects = await projectRepo.listProjects(organization.organizationId)
  
  return projects.map((p): ProjectDashboardResponse => ({
    id: p.id as any, // Cast to any to bypass type mismatch temporarily or update type
    name: p.name,
    location: p.location,
    plot_size: p.plotSize,
    land_size: p.landSize,
    building_type: p.buildingType,
    client_name: p.clientName,
    status: p.status,
    start_date: p.startDate ? p.startDate.toISOString() : null,
    target_end_date: p.targetEndDate ? p.targetEndDate.toISOString() : null,
    currency: p.currency,
    budget: p.budgetCents / 100, // Convert cents to decimal
    spent: p.spentCents / 100,
    remaining: p.remainingCents / 100,
    pct: p.budgetCents > 0 ? Math.round((p.spentCents / p.budgetCents) * 100) : 0,
  }))
}

export async function getProjectDetail(projectId: string): Promise<ProjectDetailResponse> {
  const { organization } = await requireSession()
  const project = await projectRepo.getProject(organization.organizationId, projectId)
  
  if (!project) {
    notFound("Project not found")
  }

  const allocations = await allocationRepo.listAllocations(organization.organizationId, projectId)

  const dashboardResponse: ProjectDashboardResponse = {
    id: project.id as any,
    name: project.name,
    location: project.location,
    plot_size: project.plotSize,
    land_size: project.landSize,
    building_type: project.buildingType,
    client_name: project.clientName,
    status: project.status,
    start_date: project.startDate ? project.startDate.toISOString() : null,
    target_end_date: project.targetEndDate ? project.targetEndDate.toISOString() : null,
    currency: project.currency,
    budget: project.budgetCents / 100,
    spent: project.spentCents / 100,
    remaining: project.remainingCents / 100,
    pct: project.budgetCents > 0 ? Math.round((project.spentCents / project.budgetCents) * 100) : 0,
  }

  return {
    ...dashboardResponse,
    attachments: [], // Fetch from files repo later
    tasks: allocations.map(a => ({
      id: a.id as any,
      name: a.name,
      budget: a.budgetCents / 100,
      spent: 0, // Compute later
      pct: 0,
    })),
    allocations: allocations.map(a => ({
      id: a.id as any,
      name: a.name,
      budget: a.budgetCents / 100,
      spent: 0,
      remaining: a.budgetCents / 100,
      utilization_pct: 0,
    })),
    expenses: [], // Fetch from expenses repo later
    suppliers: [], // Computed from expenses
    upcoming_payments: [], // Fetch from payments repo later
  }
}
