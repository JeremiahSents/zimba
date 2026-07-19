import { ApplicationError } from "./errors"

const CONNECTION_CODES = new Set(["08000", "08001", "08003", "08004", "08006", "08007", "08P01", "57P01", "57P02", "57P03", "ECONNREFUSED", "ECONNRESET", "ENOTFOUND"])
const TIMEOUT_CODES = new Set(["57014", "ETIMEDOUT", "ESOCKETTIMEDOUT"])

type DriverError = Error & { code?: string; constraint?: string }

export function classifyError(error: unknown, operation?: string): ApplicationError {
  if (error instanceof ApplicationError) return error

  const driverError = error instanceof Error ? (error as DriverError) : undefined
  const code = driverError?.code

  if (code === "23505") {
    return new ApplicationError("CONFLICT", undefined, { cause: error, operation })
  }
  if (code && new Set(["23502", "23503", "23514", "22P02"]).has(code)) {
    return new ApplicationError("VALIDATION_FAILED", undefined, { cause: error, operation })
  }
  if (code && TIMEOUT_CODES.has(code)) {
    return new ApplicationError("DATABASE_TIMEOUT", undefined, { cause: error, operation })
  }
  if (code && CONNECTION_CODES.has(code)) {
    return new ApplicationError("DATABASE_UNAVAILABLE", undefined, { cause: error, operation })
  }
  if (code === "40001" || code === "40P01") {
    return new ApplicationError("DATABASE_UNAVAILABLE", "The request was interrupted. Please try again.", { cause: error, operation, retryable: true })
  }

  return new ApplicationError("INTERNAL_ERROR", undefined, { cause: error, operation })
}
