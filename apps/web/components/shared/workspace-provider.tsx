"use client"

import type { ReactNode } from "react"
import {
  WorkspaceContext,
  type WorkspaceUser,
} from "@/components/shared/workspace-context"

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
