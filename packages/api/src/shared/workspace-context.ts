import type { DatabaseExecutor } from "@workspace/db/executor"
import type { WorkspaceRole } from "../schemas"

export type RequestMetadata = {
  ipAddress?: string
  userAgent?: string
}

export type WorkspaceContext = {
  userId: string
  organizationId: string
  role: WorkspaceRole
  /**
   * Set when the caller is platform staff acting through a workspace grant.
   * Carried into tenant audit rows so a customer can tell staff actions apart
   * from their own team's.
   */
  viaGrantId?: string
  metadata?: RequestMetadata
}

export type RepositoryDependencies = {
  executor: DatabaseExecutor
}

export function createWorkspaceContext(input: {
  userId: string
  organizationId: string
  role: WorkspaceRole
  viaGrantId?: string
  metadata?: RequestMetadata
}): WorkspaceContext {
  return {
    userId: input.userId,
    organizationId: input.organizationId,
    role: input.role,
    ...(input.viaGrantId ? { viaGrantId: input.viaGrantId } : {}),
    ...(input.metadata ? { metadata: input.metadata } : {}),
  }
}
