import "server-only"

import { createWorkspaceContext } from "@workspace/api"
import type { WorkspaceRole } from "@workspace/contracts"
import { requireSession } from "./service"

export async function getWorkspaceContext() {
  const session = await requireSession()
  return createWorkspaceContext({
    userId: session.user.id,
    organizationId: session.organization.organizationId,
    role: session.organization.role as WorkspaceRole,
  })
}
