"use client"

import { createContext, type ReactNode, useContext } from "react"

export type WorkspaceUser = {
  name: string
  image: string | null
  organizationName: string
  role: string
}

const WorkspaceContext = createContext<WorkspaceUser | null>(null)

export function WorkspaceProvider({
  user,
  children,
}: {
  user: WorkspaceUser
  children: ReactNode
}) {
  return (
    <WorkspaceContext.Provider value={user}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace(): WorkspaceUser {
  const context = useContext(WorkspaceContext)
  return (
    context ?? {
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
