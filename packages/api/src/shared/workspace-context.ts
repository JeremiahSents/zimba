import type { WorkspaceRole } from "@workspace/contracts"
import type { DatabaseExecutor } from "@workspace/db/repositories"

export type RequestMetadata = {
  ipAddress?: string
  userAgent?: string
}

export type WorkspaceContext = {
  userId: string
  organizationId: string
  role: WorkspaceRole
  metadata?: RequestMetadata
}

export type RepositoryDependencies = {
  executor: DatabaseExecutor
}

export function createWorkspaceContext(input: {
  userId: string
  organizationId: string
  role: WorkspaceRole
  metadata?: RequestMetadata
}): WorkspaceContext {
  return {
    userId: input.userId,
    organizationId: input.organizationId,
    role: input.role,
    ...(input.metadata ? { metadata: input.metadata } : {}),
  }
}
