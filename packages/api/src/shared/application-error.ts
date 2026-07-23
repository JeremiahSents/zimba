export type ApplicationErrorCode =
  | "VALIDATION_FAILED"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "UNEXPECTED"

export type ApplicationErrorOptions = {
  cause?: unknown
  fieldErrors?: Record<string, string[]>
  operation?: string
}

const defaultMessages: Record<ApplicationErrorCode, string> = {
  VALIDATION_FAILED: "Check the highlighted information and try again.",
  UNAUTHENTICATED: "Sign in to access this resource.",
  FORBIDDEN: "You do not have permission to perform this action.",
  NOT_FOUND: "The requested item could not be found.",
  CONFLICT: "This information has changed or already exists.",
  UNEXPECTED: "The request could not be completed. Please try again.",
}

export class ApplicationError extends Error {
  readonly code: ApplicationErrorCode
  readonly fieldErrors?: Record<string, string[]>
  readonly operation?: string

  constructor(
    code: ApplicationErrorCode,
    message?: string,
    options: ApplicationErrorOptions = {}
  ) {
    super(message ?? defaultMessages[code], { cause: options.cause })
    this.name = "ApplicationError"
    this.code = code
    this.fieldErrors = options.fieldErrors
    this.operation = options.operation
  }
}

export function validationError(
  message?: string,
  fieldErrors?: Record<string, string[]>
): never {
  throw new ApplicationError("VALIDATION_FAILED", message, { fieldErrors })
}

export function unauthenticated(message?: string): never {
  throw new ApplicationError("UNAUTHENTICATED", message)
}

export function forbidden(message?: string): never {
  throw new ApplicationError("FORBIDDEN", message)
}

export function notFoundError(message?: string): never {
  throw new ApplicationError("NOT_FOUND", message)
}

export function conflictError(message?: string): never {
  throw new ApplicationError("CONFLICT", message)
}

export function unexpectedError(message?: string): never {
  throw new ApplicationError("UNEXPECTED", message)
}
