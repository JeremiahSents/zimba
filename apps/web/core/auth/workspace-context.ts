import "server-only"

import { resolveWorkspace } from "@workspace/api"
import { db } from "@workspace/db"
import { requireSession } from "./service"

export async function getWorkspaceContext(workspaceSlug: string) {
  const session = await requireSession()
  return resolveWorkspace(session.user.id, workspaceSlug, {
    executor: db,
  })
}
