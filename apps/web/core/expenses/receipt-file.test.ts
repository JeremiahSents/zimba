import { describe, expect, it } from "vitest"
import { validateReceiptFile } from "./receipt-file"

describe("validateReceiptFile", () => {
  it("accepts supported receipt files within their limits", () => {
    expect(
      validateReceiptFile({ type: "image/png", size: 4 * 1024 * 1024 })
    ).toBeNull()
    expect(
      validateReceiptFile({ type: "application/pdf", size: 16 * 1024 * 1024 })
    ).toBeNull()
  })

  it("rejects unsupported file types", () => {
    expect(
      validateReceiptFile({ type: "application/zip", size: 1024 })
    ).toContain("PDF, JPEG, or PNG")
  })

  it("uses the server upload limits for images and PDFs", () => {
    expect(
      validateReceiptFile({ type: "image/jpeg", size: 4 * 1024 * 1024 + 1 })
    ).toContain("4 MB")
    expect(
      validateReceiptFile({
        type: "application/pdf",
        size: 16 * 1024 * 1024 + 1,
      })
    ).toContain("16 MB")
  })
})
