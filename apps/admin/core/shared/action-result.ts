import { ApplicationError, type ErrorCode, type PublicError } from "./errors"

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: PublicError }

export function actionFailure(error: PublicError): ActionResult<never> {
  return { success: false, error }
}

export function expectedActionFailure(
  code: ErrorCode,
  message?: string,
  fieldErrors?: Record<string, string[]>
): ActionResult<never> {
  return actionFailure(new ApplicationError(code, message, { fieldErrors }).toPublicError())
}
