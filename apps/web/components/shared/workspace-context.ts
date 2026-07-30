"use client"

import { createContext, useContext } from "react"

export type WorkspaceUser = {
  name: string
  image: string | null
  organizationName: string
  role: string
  viaGrant?: boolean
}

/** One entry in the switcher. Mirrors UserWorkspace from @workspace/api. */
export type WorkspaceSummary = {
  organizationId: string
  organizationName: string
  slug: string
  role: string
  viaGrant: boolean
}

export type WorkspaceContextValue = {
  user: WorkspaceUser
  /** Every workspace this person can reach, for the switcher. */
  workspaces: WorkspaceSummary[]
  /** Slug of the workspace currently being viewed. */
  currentSlug: string
  /** Owners only — the server re-checks this before creating anything. */
  canCreateWorkspace: boolean
}

export const WorkspaceContext = createContext<WorkspaceContextValue | null>(
  null
)

const FALLBACK_USER: WorkspaceUser = {
  name: "Account",
  image: null,
  organizationName: "Workspace",
  role: "member",
}

export function useWorkspace(): WorkspaceUser {
  return useContext(WorkspaceContext)?.user ?? FALLBACK_USER
}

export function useWorkspaceList(): WorkspaceContextValue {
  return (
    useContext(WorkspaceContext) ?? {
      user: FALLBACK_USER,
      workspaces: [],
      currentSlug: "",
      canCreateWorkspace: false,
    }
  )
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  const first = parts[0]?.[0] ?? ""
  const last = parts.length > 1 ? (parts.at(-1)?.[0] ?? "") : ""
  return `${first}${last}`.toUpperCase() || "?"
}

export function formatRole(role: string): string {
  return role.charAt(0).toUpperCase() + role.slice(1)
}
