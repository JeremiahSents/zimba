import type { ActionResult } from "./action-result"
import { classifyError } from "./error-classifier"
import { logApplicationError } from "./error-logger"

export function handleActionError(
  error: unknown,
  operation: string
): ActionResult<never> {
  const applicationError = classifyError(error, operation)
  logApplicationError(applicationError, { operation })
  return { success: false, error: applicationError.toPublicError() }
}
