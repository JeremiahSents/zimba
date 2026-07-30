"use client"

import { type ReactNode, useMemo } from "react"
import {
  WorkspaceContext,
  type WorkspaceSummary,
  type WorkspaceUser,
} from "@/components/shared/workspace-context"

export function WorkspaceProvider({
  user,
  workspaces,
  currentSlug,
  canCreateWorkspace,
  children,
}: {
  user: WorkspaceUser
  workspaces: WorkspaceSummary[]
  currentSlug: string
  canCreateWorkspace: boolean
  children: ReactNode
}) {
  const value = useMemo(
    () => ({ user, workspaces, currentSlug, canCreateWorkspace }),
    [user, workspaces, currentSlug, canCreateWorkspace]
  )

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  )
}
