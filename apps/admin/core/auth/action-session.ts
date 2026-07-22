import "server-only"

import type { ActionResult } from "../shared/action-result"
import { handleActionError } from "../shared/handle-action-error"
import { requirePlatformRole, type PlatformRole } from "./service"

export async function ensureActionSession(
  operation: string,
  roles: readonly PlatformRole[] = ["super_admin", "support"]
): Promise<ActionResult<never> | null> {
  try {
    await requirePlatformRole(roles)
    return null
  } catch (error) {
    return handleActionError(error, `${operation}.authenticate`)
  }
}
