import { and, desc, eq, isNotNull, isNull } from "drizzle-orm"
import type { DatabaseExecutor } from "../shared/executor"
import { budgetItem, project } from "./schema"

export function findProjectForOrganization(
  executor: DatabaseExecutor,
  organizationId: string,
  projectId: string
) {
  return executor
    .select()
    .from(project)
    .where(
      and(eq(project.id, projectId), eq(project.organizationId, organizationId))
    )
    .limit(1)
}

export function findActiveProjectForOrganization(
  executor: DatabaseExecutor,
  organizationId: string,
  projectId: string
) {
  return executor
    .select()
    .from(project)
    .where(
      and(
        eq(project.id, projectId),
        eq(project.organizationId, organizationId),
        isNull(project.archivedAt)
      )
    )
    .limit(1)
}

export async function createProject(
  executor: DatabaseExecutor,
  data: typeof project.$inferInsert
) {
  const [created] = await executor.insert(project).values(data).returning()
  return created
}

export async function updateProjectForOrganization(
  executor: DatabaseExecutor,
  organizationId: string,
  projectId: string,
  data: Partial<typeof project.$inferInsert>
) {
  const [updated] = await executor
    .update(project)
    .set({ ...data, updatedAt: new Date() })
    .where(
      and(eq(project.id, projectId), eq(project.organizationId, organizationId))
    )
    .returning()
  return updated
}

export async function deleteProjectForOrganization(
  executor: DatabaseExecutor,
  organizationId: string,
  projectId: string
) {
  const [deleted] = await executor
    .delete(project)
    .where(
      and(eq(project.id, projectId), eq(project.organizationId, organizationId))
    )
    .returning()
  return deleted
}

export function listProjectsForOrganization(
  executor: DatabaseExecutor,
  organizationId: string
) {
  return executor
    .select()
    .from(project)
    .where(
      and(
        eq(project.organizationId, organizationId),
        isNull(project.archivedAt)
      )
    )
    .orderBy(desc(project.createdAt))
}

export function listArchivedProjectsForOrganization(
  executor: DatabaseExecutor,
  organizationId: string
) {
  return executor
    .select()
    .from(project)
    .where(
      and(
        eq(project.organizationId, organizationId),
        isNotNull(project.archivedAt)
      )
    )
    .orderBy(desc(project.archivedAt))
}

export function listAllocationsForProject(
  executor: DatabaseExecutor,
  organizationId: string,
  projectId: string
) {
  return executor
    .select()
    .from(budgetItem)
    .where(
      and(
        eq(budgetItem.organizationId, organizationId),
        eq(budgetItem.projectId, projectId)
      )
    )
    .orderBy(desc(budgetItem.createdAt))
}

export function findAllocationForProject(
  executor: DatabaseExecutor,
  organizationId: string,
  projectId: string,
  budgetItemId: string
) {
  return executor
    .select()
    .from(budgetItem)
    .where(
      and(
        eq(budgetItem.id, budgetItemId),
        eq(budgetItem.projectId, projectId),
        eq(budgetItem.organizationId, organizationId)
      )
    )
    .limit(1)
}

export async function createAllocation(
  executor: DatabaseExecutor,
  data: typeof budgetItem.$inferInsert
) {
  const [created] = await executor.insert(budgetItem).values(data).returning()
  return created
}

export async function updateAllocation(
  executor: DatabaseExecutor,
  organizationId: string,
  projectId: string,
  budgetItemId: string,
  data: Partial<typeof budgetItem.$inferInsert>
) {
  const [updated] = await executor
    .update(budgetItem)
    .set({ ...data, updatedAt: new Date() })
    .where(
      and(
        eq(budgetItem.id, budgetItemId),
        eq(budgetItem.projectId, projectId),
        eq(budgetItem.organizationId, organizationId)
      )
    )
    .returning()
  return updated
}
