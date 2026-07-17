export class ApplicationError extends Error {
  constructor(
    public code: "unauthorized" | "forbidden" | "not_found" | "bad_request" | "conflict" | "internal_error",
    message: string
  ) {
    super(message)
    this.name = "ApplicationError"
  }
}

export function unauthorized(message = "Unauthorized"): never {
  throw new ApplicationError("unauthorized", message)
}

export function forbidden(message = "Forbidden"): never {
  throw new ApplicationError("forbidden", message)
}

export function notFound(message = "Not found"): never {
  throw new ApplicationError("not_found", message)
}

export function badRequest(message = "Bad request"): never {
  throw new ApplicationError("bad_request", message)
}

export function conflict(message = "Conflict"): never {
  throw new ApplicationError("conflict", message)
}
