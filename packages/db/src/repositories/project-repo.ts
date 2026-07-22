import { and, desc, eq, isNull } from "drizzle-orm"
import { allocation, project } from "../schemas/project-schema"
import type { DatabaseExecutor } from "./types"

export function findProjectForOrganization(executor: DatabaseExecutor, organizationId: string, projectId: string) {
  return executor.select().from(project).where(and(eq(project.id, projectId), eq(project.organizationId, organizationId))).limit(1)
}

export function listProjectsForOrganization(executor: DatabaseExecutor, organizationId: string) {
  return executor.select().from(project).where(and(eq(project.organizationId, organizationId), isNull(project.archivedAt))).orderBy(desc(project.createdAt))
}

export function listAllocationsForProject(executor: DatabaseExecutor, organizationId: string, projectId: string) {
  return executor.select().from(allocation).where(and(eq(allocation.organizationId, organizationId), eq(allocation.projectId, projectId))).orderBy(desc(allocation.createdAt))
}
