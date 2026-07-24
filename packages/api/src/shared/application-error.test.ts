import { describe, expect, it } from "vitest"
import {
  ApplicationError,
  conflictError,
  forbidden,
  notFoundError,
  unauthenticated,
  unexpectedError,
  validationError,
} from "./application-error"

describe("application errors", () => {
  it("creates a validation error with field errors", () => {
    try {
      validationError("Invalid input", { name: ["Required"] })
      expect.fail("should throw")
    } catch (error) {
      expect(error).toBeInstanceOf(ApplicationError)
      expect((error as ApplicationError).code).toBe("VALIDATION_FAILED")
      expect((error as ApplicationError).fieldErrors).toEqual({
        name: ["Required"],
      })
    }
  })

  it("creates an unauthenticated error", () => {
    try {
      unauthenticated()
      expect.fail("should throw")
    } catch (error) {
      expect((error as ApplicationError).code).toBe("UNAUTHENTICATED")
    }
  })

  it("creates a forbidden error", () => {
    try {
      forbidden()
      expect.fail("should throw")
    } catch (error) {
      expect((error as ApplicationError).code).toBe("FORBIDDEN")
    }
  })

  it("creates a not found error", () => {
    try {
      notFoundError()
      expect.fail("should throw")
    } catch (error) {
      expect((error as ApplicationError).code).toBe("NOT_FOUND")
    }
  })

  it("creates a conflict error", () => {
    try {
      conflictError()
      expect.fail("should throw")
    } catch (error) {
      expect((error as ApplicationError).code).toBe("CONFLICT")
    }
  })

  it("creates an unexpected error", () => {
    try {
      unexpectedError()
      expect.fail("should throw")
    } catch (error) {
      expect((error as ApplicationError).code).toBe("UNEXPECTED")
    }
  })

  it("uses default messages when none provided", () => {
    const error = new ApplicationError("VALIDATION_FAILED")
    expect(error.message).toBe(
      "Check the highlighted information and try again."
    )
  })

  it("preserves cause", () => {
    const cause = new Error("root cause")
    const error = new ApplicationError("UNEXPECTED", undefined, { cause })
    expect(error.cause).toBe(cause)
  })
})
