import type { WorkspaceRole } from "@workspace/contracts"
import { forbidden } from "./application-error"

const roleHierarchy: Record<WorkspaceRole, number> = {
  owner: 4,
  site_manager: 3,
  accountant: 2,
  viewer: 1,
}

export function requireRole(
  actual: WorkspaceRole,
  allowed: readonly WorkspaceRole[]
): WorkspaceRole {
  if (!allowed.includes(actual)) {
    forbidden("You do not have permission to perform this action.")
  }
  return actual
}

export function requireMinimumRole(
  actual: WorkspaceRole,
  minimum: WorkspaceRole
): WorkspaceRole {
  if (roleHierarchy[actual] < roleHierarchy[minimum]) {
    forbidden("You do not have permission to perform this action.")
  }
  return actual
}

export function canManageWorkspace(role: WorkspaceRole): boolean {
  return roleHierarchy[role] >= roleHierarchy.site_manager
}

export function isOwner(role: WorkspaceRole): boolean {
  return role === "owner"
}
