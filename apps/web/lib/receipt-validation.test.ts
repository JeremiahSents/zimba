import { describe, expect, it } from "vitest"
import { hasValidPayableLines } from "./receipt-validation"

const validLine = {
  allocation_id: 1,
  description: "Food truck",
  quantity: 1,
  unit_amount: 2_000_000,
}

describe("hasValidPayableLines", () => {
  it("accepts a complete finite line", () => {
    expect(hasValidPayableLines([validLine])).toBe(true)
    expect(hasValidPayableLines([{ ...validLine, allocation_id: "1" }])).toBe(
      true
    )
  })

  it.each([
    { ...validLine, allocation_id: Number.NaN },
    { ...validLine, allocation_id: 0 },
    { ...validLine, quantity: Number.POSITIVE_INFINITY },
    { ...validLine, quantity: 0 },
    { ...validLine, unit_amount: Number.NaN },
    { ...validLine, unit_amount: -1 },
  ])("rejects invalid numeric values", (line) => {
    expect(hasValidPayableLines([line])).toBe(false)
  })
})
