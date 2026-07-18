import "server-only"

import { forbidden } from "../shared/errors"

export type WorkspaceRole = "owner" | "site_manager" | "accountant" | "viewer"
const aliases: Record<string, WorkspaceRole> = { "Owner / Admin": "owner", owner: "owner", admin: "owner", "Site manager": "site_manager", site_manager: "site_manager", Accountant: "accountant", accountant: "accountant", viewer: "viewer" }

export function normalizeRole(role: string): WorkspaceRole {
  return aliases[role] ?? "viewer"
}

export function requireRole(actual: string, allowed: WorkspaceRole[]) {
  const role = normalizeRole(actual)
  if (!allowed.includes(role)) forbidden("You do not have permission to perform this action.")
  return role
}

export function canGrantRole(actor: string, target: WorkspaceRole) {
  const role = normalizeRole(actor)
  if (role === "owner") return true
  return role === "site_manager" && target !== "owner"
}
