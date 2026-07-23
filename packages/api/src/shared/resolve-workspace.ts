import type {
  ResolvedWorkspaceContext,
  WorkspaceRole,
} from "@workspace/contracts"
import type { DatabaseExecutor } from "@workspace/db/repositories"
import {
  findMembershipByUserAndOrganization,
  findWorkspaceBySlug,
} from "@workspace/db/repositories"
import { notFoundError } from "../shared/application-error"

const validRoles: WorkspaceRole[] = [
  "owner",
  "site_manager",
  "accountant",
  "viewer",
]

function normalizeRole(role: string): WorkspaceRole {
  return validRoles.includes(role as WorkspaceRole)
    ? (role as WorkspaceRole)
    : "viewer"
}

export async function resolveWorkspace(
  userId: string,
  slug: string,
  deps: { executor: DatabaseExecutor }
): Promise<ResolvedWorkspaceContext> {
  const workspace = await findWorkspaceBySlug(deps.executor, slug)
  if (!workspace) notFoundError("Workspace not found.")

  const membership = await findMembershipByUserAndOrganization(
    deps.executor,
    userId,
    workspace.id
  )
  if (!membership) notFoundError("Workspace not found.")

  return {
    organizationId: workspace.id,
    organizationName: workspace.name,
    slug: workspace.slug,
    userId,
    role: normalizeRole(membership.role),
  }
}
