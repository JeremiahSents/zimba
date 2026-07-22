import "server-only"
import { db } from "@workspace/db"
import { createAllocation as insertAllocation, listAllocationsForProject, updateAllocation as changeAllocation } from "@workspace/db/repositories"
import type { allocation } from "@workspace/db/schema"

export async function listAllocations(organizationId: string, projectId: string) {
  return listAllocationsForProject(db, organizationId, projectId)
}

export async function createAllocation(data: typeof allocation.$inferInsert) {
  return insertAllocation(db, data)
}

export async function updateAllocation(organizationId: string, projectId: string, allocationId: string, data: Partial<typeof allocation.$inferInsert>) {
  return changeAllocation(db, organizationId, projectId, allocationId, data)
}
