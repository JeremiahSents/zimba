import type {
  ResolvedWorkspaceContext,
  WorkspaceRole,
} from "@workspace/contracts"
import { workspaceSlugSchema } from "@workspace/contracts"
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

function parseRole(role: string): WorkspaceRole {
  if (!validRoles.includes(role as WorkspaceRole)) {
    notFoundError("Workspace not found.")
  }
  return role as WorkspaceRole
}

export async function resolveWorkspace(
  userId: string,
  slug: string,
  deps: { executor: DatabaseExecutor }
): Promise<ResolvedWorkspaceContext> {
  const parsedSlug = workspaceSlugSchema.safeParse(slug)
  if (!parsedSlug.success) notFoundError("Workspace not found.")

  const workspace = await findWorkspaceBySlug(deps.executor, parsedSlug.data)
  if (workspace?.status !== "active") {
    notFoundError("Workspace not found.")
  }

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
    role: parseRole(membership.role),
  }
}
