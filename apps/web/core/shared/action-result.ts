import type { ActionResult as SharedActionResult } from "@workspace/server-primitives"
import { ApplicationError, type ErrorCode, type PublicError } from "./errors"

export type ActionResult<T = void> = SharedActionResult<T>

export function actionFailure(error: PublicError): ActionResult<never> {
  return { success: false, error }
}

export function expectedActionFailure(
  code: ErrorCode,
  message?: string,
  fieldErrors?: Record<string, string[]>
): ActionResult<never> {
  return actionFailure(
    new ApplicationError(code, message, { fieldErrors }).toPublicError()
  )
}
