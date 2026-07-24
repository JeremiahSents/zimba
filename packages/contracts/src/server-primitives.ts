import type { ZodError } from "zod"

export const errorCodes = [
  "VALIDATION_FAILED",
  "UNAUTHENTICATED",
  "FORBIDDEN",
  "NOT_FOUND",
  "CONFLICT",
  "DATABASE_UNAVAILABLE",
  "DATABASE_TIMEOUT",
  "NETWORK_UNAVAILABLE",
  "EXTERNAL_SERVICE_FAILED",
  "UPLOAD_FAILED",
  "RATE_LIMITED",
  "INTERNAL_ERROR",
] as const

export type ErrorCode = (typeof errorCodes)[number]

export type RecoveryAction =
  | "RETRY"
  | "RELOAD"
  | "CHECK_CONNECTION"
  | "SIGN_IN"
  | "CORRECT_INPUT"
  | "GO_BACK"
  | "CONTACT_SUPPORT"

export type PublicError = {
  code: ErrorCode
  message: string
  retryable: boolean
  recoveryAction: RecoveryAction
  fieldErrors?: Record<string, string[]>
}

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: PublicError }

export function fieldErrorsFromZod(error: ZodError): Record<string, string[]> {
  const fields: Record<string, string[]> = {}
  for (const issue of error.issues) {
    const key = issue.path.length ? issue.path.join(".") : "form"
    fields[key] = [...(fields[key] ?? []), issue.message]
  }
  return fields
}
