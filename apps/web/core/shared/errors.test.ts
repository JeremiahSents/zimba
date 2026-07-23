import { describe, expect, it } from "vitest"
import { expectedActionFailure } from "./action-result"
import { classifyError } from "./error-classifier"
import { ApplicationError, isPublicError } from "./errors"

function driverError(code: string) {
  return Object.assign(new Error("internal database detail"), { code })
}

describe("application errors", () => {
  it("serializes only client-safe fields", () => {
    const cause = new Error("secret internal detail")
    const error = new ApplicationError("DATABASE_TIMEOUT", undefined, {
      cause,
      operation: "projects.list",
    })

    const publicError = error.toPublicError()
    expect(isPublicError(publicError)).toBe(true)
    expect(publicError).toMatchObject({
      code: "DATABASE_TIMEOUT",
      retryable: true,
      recoveryAction: "RETRY",
    })
    expect(JSON.stringify(publicError)).not.toContain("secret internal detail")
    expect(JSON.stringify(publicError)).not.toContain("projects.list")
  })

  it.each([
    ["23505", "CONFLICT", false],
    ["23503", "VALIDATION_FAILED", false],
    ["57014", "DATABASE_TIMEOUT", true],
    ["ECONNREFUSED", "DATABASE_UNAVAILABLE", true],
    ["40P01", "DATABASE_UNAVAILABLE", true],
  ] as const)("classifies driver code %s", (code, expectedCode, retryable) => {
    const error = classifyError(driverError(code), "database.test")
    expect(error.code).toBe(expectedCode)
    expect(error.retryable).toBe(retryable)
    expect(error.operation).toBe("database.test")
  })

  it("preserves known application errors", () => {
    const original = new ApplicationError("NOT_FOUND", "Project not found")
    expect(classifyError(original)).toBe(original)
  })

  it("creates typed expected action failures", () => {
    const result = expectedActionFailure(
      "VALIDATION_FAILED",
      "Add a project name.",
      {
        name: ["Required"],
      }
    )
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.fieldErrors).toEqual({ name: ["Required"] })
      expect(result.error.recoveryAction).toBe("CORRECT_INPUT")
    }
  })
})
