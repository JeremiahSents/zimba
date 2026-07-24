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
  referenceId?: string
  fieldErrors?: Record<string, string[]>
}

type ApplicationErrorOptions = {
  cause?: unknown
  fieldErrors?: Record<string, string[]>
  operation?: string
  referenceId?: string
  retryable?: boolean
  recoveryAction?: RecoveryAction
  metadata?: Record<string, string | number | boolean | null>
}

const defaults: Record<
  ErrorCode,
  Pick<PublicError, "message" | "retryable" | "recoveryAction">
> = {
  VALIDATION_FAILED: {
    message: "Check the highlighted information and try again.",
    retryable: false,
    recoveryAction: "CORRECT_INPUT",
  },
  UNAUTHENTICATED: {
    message: "Your session has expired. Sign in to continue.",
    retryable: false,
    recoveryAction: "SIGN_IN",
  },
  FORBIDDEN: {
    message: "You do not have permission to complete this action.",
    retryable: false,
    recoveryAction: "GO_BACK",
  },
  NOT_FOUND: {
    message: "The requested item could not be found.",
    retryable: false,
    recoveryAction: "GO_BACK",
  },
  CONFLICT: {
    message:
      "This information has changed or already exists. Review it and try again.",
    retryable: false,
    recoveryAction: "RELOAD",
  },
  DATABASE_UNAVAILABLE: {
    message: "The service is temporarily unavailable. Please try again.",
    retryable: true,
    recoveryAction: "RETRY",
  },
  DATABASE_TIMEOUT: {
    message: "The request took too long. Please try again.",
    retryable: true,
    recoveryAction: "RETRY",
  },
  NETWORK_UNAVAILABLE: {
    message:
      "The connection was interrupted. Check your connection and try again.",
    retryable: true,
    recoveryAction: "CHECK_CONNECTION",
  },
  EXTERNAL_SERVICE_FAILED: {
    message: "A connected service did not respond. Please try again.",
    retryable: true,
    recoveryAction: "RETRY",
  },
  UPLOAD_FAILED: {
    message: "The file could not be uploaded. Please try again.",
    retryable: true,
    recoveryAction: "RETRY",
  },
  RATE_LIMITED: {
    message: "Too many requests were made. Wait a moment and try again.",
    retryable: true,
    recoveryAction: "RETRY",
  },
  INTERNAL_ERROR: {
    message: "The request could not be completed. Please try again.",
    retryable: true,
    recoveryAction: "RETRY",
  },
}

export class ApplicationError extends Error {
  readonly code: ErrorCode
  readonly fieldErrors?: Record<string, string[]>
  readonly operation?: string
  readonly referenceId: string
  readonly retryable: boolean
  readonly recoveryAction: RecoveryAction
  readonly metadata?: Record<string, string | number | boolean | null>

  constructor(
    code: ErrorCode,
    message?: string,
    options: ApplicationErrorOptions = {}
  ) {
    super(message ?? defaults[code].message, { cause: options.cause })
    this.name = "ApplicationError"
    this.code = code
    this.fieldErrors = options.fieldErrors
    this.operation = options.operation
    this.referenceId = options.referenceId ?? crypto.randomUUID()
    this.retryable = options.retryable ?? defaults[code].retryable
    this.recoveryAction =
      options.recoveryAction ?? defaults[code].recoveryAction
    this.metadata = options.metadata
  }

  toPublicError(): PublicError {
    return {
      code: this.code,
      message: this.message,
      retryable: this.retryable,
      recoveryAction: this.recoveryAction,
      referenceId: this.referenceId,
      ...(this.fieldErrors ? { fieldErrors: this.fieldErrors } : {}),
    }
  }
}

export function isPublicError(value: unknown): value is PublicError {
  if (!value || typeof value !== "object") return false
  const candidate = value as Partial<PublicError>
  return Boolean(
    candidate.code &&
      errorCodes.includes(candidate.code) &&
      typeof candidate.message === "string" &&
      typeof candidate.retryable === "boolean" &&
      typeof candidate.recoveryAction === "string"
  )
}

export function validationError(
  message?: string,
  fieldErrors?: Record<string, string[]>
): never {
  throw new ApplicationError("VALIDATION_FAILED", message, { fieldErrors })
}

export function unauthorized(message?: string): never {
  throw new ApplicationError("UNAUTHENTICATED", message)
}

export function forbidden(message?: string): never {
  throw new ApplicationError("FORBIDDEN", message)
}

export function notFound(message?: string): never {
  throw new ApplicationError("NOT_FOUND", message)
}

export function badRequest(message?: string): never {
  validationError(message)
}

export function conflict(message?: string): never {
  throw new ApplicationError("CONFLICT", message)
}
