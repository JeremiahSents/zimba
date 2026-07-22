import { describe, expect, it } from "vitest"
import { emailSchema, receiptLineSchema, supplierInputSchema } from "./index"

describe("shared contracts", () => {
  it("accepts valid receipt lines", () => {
    expect(receiptLineSchema.parse({ allocationId: "allocation-1", itemDescription: "Cement", quantity: 2, unitRateCents: 5000, amountCents: 10000 })).toMatchObject({ quantity: 2 })
  })

  it("rejects invalid emails", () => {
    expect(emailSchema.safeParse("not-an-email").success).toBe(false)
  })

  it("enforces supplier field bounds", () => {
    expect(supplierInputSchema.safeParse({ organizationId: "org-1", name: "", category: "materials" }).success).toBe(false)
  })
})
