import { and, desc, eq, isNotNull, isNull } from "drizzle-orm"
import { allocation, project } from "../schemas/project-schema"
import type { DatabaseExecutor } from "./types"

export function findProjectForOrganization(executor: DatabaseExecutor, organizationId: string, projectId: string) {
  return executor.select().from(project).where(and(eq(project.id, projectId), eq(project.organizationId, organizationId))).limit(1)
}

export function findActiveProjectForOrganization(executor: DatabaseExecutor, organizationId: string, projectId: string) {
  return executor.select().from(project).where(and(eq(project.id, projectId), eq(project.organizationId, organizationId), isNull(project.archivedAt))).limit(1)
}

export async function createProject(executor: DatabaseExecutor, data: typeof project.$inferInsert) {
  const [created] = await executor.insert(project).values(data).returning()
  return created
}

export async function updateProjectForOrganization(executor: DatabaseExecutor, organizationId: string, projectId: string, data: Partial<typeof project.$inferInsert>) {
  const [updated] = await executor.update(project).set({ ...data, updatedAt: new Date() }).where(and(eq(project.id, projectId), eq(project.organizationId, organizationId))).returning()
  return updated
}

export async function deleteProjectForOrganization(executor: DatabaseExecutor, organizationId: string, projectId: string) {
  const [deleted] = await executor.delete(project).where(and(eq(project.id, projectId), eq(project.organizationId, organizationId))).returning()
  return deleted
}

export function listProjectsForOrganization(executor: DatabaseExecutor, organizationId: string) {
  return executor.select().from(project).where(and(eq(project.organizationId, organizationId), isNull(project.archivedAt))).orderBy(desc(project.createdAt))
}

export function listArchivedProjectsForOrganization(executor: DatabaseExecutor, organizationId: string) {
  return executor.select().from(project).where(and(eq(project.organizationId, organizationId), isNotNull(project.archivedAt))).orderBy(desc(project.archivedAt))
}

export function listAllocationsForProject(executor: DatabaseExecutor, organizationId: string, projectId: string) {
  return executor.select().from(allocation).where(and(eq(allocation.organizationId, organizationId), eq(allocation.projectId, projectId))).orderBy(desc(allocation.createdAt))
}

export function findAllocationForProject(executor: DatabaseExecutor, organizationId: string, projectId: string, allocationId: string) {
  return executor.select().from(allocation).where(and(eq(allocation.id, allocationId), eq(allocation.projectId, projectId), eq(allocation.organizationId, organizationId))).limit(1)
}

export async function createAllocation(executor: DatabaseExecutor, data: typeof allocation.$inferInsert) {
  const [created] = await executor.insert(allocation).values(data).returning()
  return created
}

export async function updateAllocation(executor: DatabaseExecutor, organizationId: string, projectId: string, allocationId: string, data: Partial<typeof allocation.$inferInsert>) {
  const [updated] = await executor.update(allocation).set({ ...data, updatedAt: new Date() }).where(and(eq(allocation.id, allocationId), eq(allocation.projectId, projectId), eq(allocation.organizationId, organizationId))).returning()
  return updated
}
