import { db } from "@workspace/db"
import {
  findMembershipByUserAndOrganization,
  findWorkspaceBySlug,
} from "@workspace/db/organizations"
import { findActiveGrantForUserAndOrg } from "@workspace/db/platform"
import type { ResolvedWorkspaceContext, WorkspaceRole } from "../schemas"
import { workspaceSlugSchema } from "../schemas"
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
  slug: string
): Promise<ResolvedWorkspaceContext> {
  const parsedSlug = workspaceSlugSchema.safeParse(slug)
  if (!parsedSlug.success) notFoundError("Workspace not found.")

  const workspace = await findWorkspaceBySlug(db, parsedSlug.data)
  if (workspace?.status !== "active") {
    notFoundError("Workspace not found.")
  }

  const membership = await findMembershipByUserAndOrganization(
    db,
    userId,
    workspace.id
  )
  if (membership) {
    return {
      organizationId: workspace.id,
      organizationName: workspace.name,
      slug: workspace.slug,
      userId,
      role: parseRole(membership.role),
    }
  }

  const [grant] = await findActiveGrantForUserAndOrg(db, userId, workspace.id)
  if (grant) {
    return {
      organizationId: workspace.id,
      organizationName: workspace.name,
      slug: workspace.slug,
      userId,
      role: parseRole(grant.role),
      viaGrantId: grant.id,
      grantExpiresAt: grant.expiresAt,
    }
  }

  notFoundError("Workspace not found.")
}
