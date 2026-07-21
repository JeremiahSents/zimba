import "server-only"

import type { ActionResult } from "../shared/action-result"
import { handleActionError } from "../shared/handle-action-error"
import { requirePlatformSession } from "./service"

export async function ensureActionSession(operation: string): Promise<ActionResult<never> | null> {
  try {
    await requirePlatformSession()
    return null
  } catch (error) {
    return handleActionError(error, `${operation}.authenticate`)
  }
}
