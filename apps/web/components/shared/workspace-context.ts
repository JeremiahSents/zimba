"use client"

import { createContext, useContext } from "react"

export type WorkspaceUser = {
  authBypass: boolean
  name: string
  image: string | null
  organizationName: string
  role: string
}

export const WorkspaceContext = createContext<WorkspaceUser | null>(null)

export function useWorkspace(): WorkspaceUser {
  const context = useContext(WorkspaceContext)
  return (
    context ?? {
      authBypass: false,
      name: "Account",
      image: null,
      organizationName: "Workspace",
      role: "member",
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
