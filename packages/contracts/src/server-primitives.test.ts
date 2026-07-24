import { describe, expect, it } from "vitest"
import { z } from "zod"
import { fieldErrorsFromZod } from "./server-primitives"

describe("server primitives", () => {
  it("converts Zod issues into stable field errors", () => {
    const result = z
      .object({ email: z.email(), name: z.string().min(1) })
      .safeParse({ email: "bad", name: "" })
    if (result.success) throw new Error("expected invalid input")
    expect(Object.keys(fieldErrorsFromZod(result.error))).toEqual([
      "email",
      "name",
    ])
  })
})
