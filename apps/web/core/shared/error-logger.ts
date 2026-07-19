import type { ApplicationError } from "./errors"

export function logApplicationError(error: ApplicationError, context: Record<string, string | number | boolean | null> = {}) {
  const cause = error.cause instanceof Error
    ? {
        name: error.cause.name,
        ...(process.env.NODE_ENV === "development" ? { message: error.cause.message, stack: error.cause.stack } : {}),
        ...("code" in error.cause && typeof error.cause.code === "string" ? { code: error.cause.code } : {}),
      }
    : error.cause

  console.error("Zimba operation failed", {
    timestamp: new Date().toISOString(),
    code: error.code,
    referenceId: error.referenceId,
    operation: error.operation,
    retryable: error.retryable,
    context,
    metadata: error.metadata,
    cause,
    stack: error.stack,
  })
}
