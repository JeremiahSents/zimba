import { describe, expect, it } from "vitest"
import { receiptLineSchema } from "../receipts/schemas"
import { supplierInputSchema } from "../suppliers/schemas"
import { emailSchema } from "./schemas"

describe("shared contracts", () => {
  it("accepts valid receipt lines", () => {
    expect(
      receiptLineSchema.parse({
        allocationId: "allocation-1",
        itemDescription: "Cement",
        quantity: 2,
        unitRateCents: 5000,
        amountCents: 10000,
      })
    ).toMatchObject({ quantity: 2 })
  })

  it("rejects invalid emails", () => {
    expect(emailSchema.safeParse("not-an-email").success).toBe(false)
  })

  it("accepts receipt lines at real UGX scale", () => {
    // 15,000,000 UGX in cents — an ordinary construction receipt.
    expect(
      receiptLineSchema.safeParse({
        allocationId: "allocation-1",
        itemDescription: "Steel bars",
        quantity: 1,
        unitRateCents: 1_500_000_000,
        amountCents: 1_500_000_000,
      }).success
    ).toBe(true)
  })

  it("enforces supplier field bounds", () => {
    expect(
      supplierInputSchema.safeParse({
        organizationId: "org-1",
        name: "",
        category: "materials",
      }).success
    ).toBe(false)
  })

  it("accepts null for blank optional supplier fields", () => {
    expect(
      supplierInputSchema.safeParse({
        organizationId: "org-1",
        name: "Egerton",
        category: "labour",
        companyContact: "0747767916",
        contactName: "Joseph Ergton",
        phone: "0747767916",
        email: "ergton@build.africa",
        notes: null,
      }).success
    ).toBe(true)
  })
})
