import "server-only"

import { getSessionWithOrganization } from "./service"

export async function getWorkspaceSlug(): Promise<string> {
  const session = await getSessionWithOrganization()
  return session?.organization?.slug ?? "workspace"
}
