import type { ApplicationError } from "./errors"

export function logApplicationError(error: ApplicationError, context: Record<string, string | number | boolean | null> = {}) {
  const rootCause = findRootCause(error.cause)
  const cause = error.cause instanceof Error
    ? {
        name: error.cause.name,
        ...(process.env.NODE_ENV === "development" ? { message: error.cause.message, stack: error.cause.stack } : {}),
        ...("code" in rootCause && typeof rootCause.code === "string" ? { code: rootCause.code } : {}),
        ...("constraint" in rootCause && typeof rootCause.constraint === "string" ? { constraint: rootCause.constraint } : {}),
      }
    : error.cause

  console.error("Zimba admin operation failed", {
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

function findRootCause(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object") return {}
  const candidate = value as Record<string, unknown>
  return candidate.cause && typeof candidate.cause === "object"
    ? findRootCause(candidate.cause)
    : candidate
}
