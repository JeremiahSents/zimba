import { describe, expect, it } from "vitest"
import { renderPaymentVoucherPdf, renderReceiptPdf } from "../../pdf/render"
import type { PaymentVoucherData, ReceiptDocumentData } from "../../pdf/types"

/**
 * These render for real rather than mocking @react-pdf/renderer, because the
 * failures worth catching here only happen at render time: a duplicated React
 * instance (the generated `usePdfxTheme` swallows the invalid-hook error and
 * silently falls back to the default theme), a font the standard-14 set does
 * not have, and a component prop mismatch. None of that shows up in a
 * typecheck.
 */

const receipt: ReceiptDocumentData = {
  documentNumber: "ZIM-004821",
  issuedAt: "2026-07-30T09:00:00.000Z",
  expenseDate: "2026-07-28T00:00:00.000Z",
  currency: "UGX",
  organization: {
    name: "Zimba Construction",
    email: "accounts@zimba.test",
    phone: "+256 700 000 000",
  },
  supplier: {
    name: "Kampala Hardware",
    email: "sales@kampalahardware.test",
    phone: null,
  },
  projectName: "Ntinda Site B",
  lines: [
    {
      description: "Cement (50kg)",
      allocationName: "Materials",
      quantity: 40,
      unitRateCents: 3_800_000,
      amountCents: 152_000_000,
    },
    {
      description: "Delivery",
      allocationName: "Logistics",
      quantity: 1,
      unitRateCents: 15_000_000,
      amountCents: 15_000_000,
    },
  ],
  totalCents: 167_000_000,
  paidCents: 67_000_000,
  outstandingCents: 100_000_000,
  settlementStatus: "partially_paid",
  payments: [
    {
      amountCents: 67_000_000,
      currency: "UGX",
      method: "mobile_money",
      reference: "MM-88213",
      paidAt: "2026-07-29T00:00:00.000Z",
    },
  ],
}

const voucher: PaymentVoucherData = {
  voucherNumber: "ZIM-004821-P1",
  issuedAt: "2026-07-30T09:00:00.000Z",
  paidAt: "2026-07-29T00:00:00.000Z",
  amountCents: 67_000_000,
  currency: "UGX",
  method: "mobile_money",
  reference: "MM-88213",
  organization: receipt.organization,
  supplier: receipt.supplier,
  projectName: "Ntinda Site B",
  againstDocumentNumber: "ZIM-004821",
  againstTotalCents: 167_000_000,
  runningPaidCents: 67_000_000,
  runningOutstandingCents: 100_000_000,
}

function expectPdf(buffer: Buffer) {
  expect(buffer.subarray(0, 5).toString("latin1")).toBe("%PDF-")
  expect(buffer.byteLength).toBeGreaterThan(1024)
}

describe("renderReceiptPdf", () => {
  it("renders a PDF", async () => {
    expectPdf(await renderReceiptPdf(receipt))
  })

  it("renders when the receipt has no payments and no project", async () => {
    expectPdf(
      await renderReceiptPdf({
        ...receipt,
        projectName: null,
        expenseDate: null,
        supplier: { name: "Unknown supplier", email: null, phone: null },
        paidCents: 0,
        outstandingCents: receipt.totalCents,
        settlementStatus: "unpaid",
        payments: [],
      })
    )
  })
})

describe("renderPaymentVoucherPdf", () => {
  it("renders a PDF", async () => {
    expectPdf(await renderPaymentVoucherPdf(voucher))
  })

  it("renders a payment that settles nothing", async () => {
    expectPdf(
      await renderPaymentVoucherPdf({
        ...voucher,
        reference: null,
        projectName: null,
        againstDocumentNumber: null,
        againstTotalCents: null,
        runningPaidCents: null,
        runningOutstandingCents: null,
      })
    )
  })
})
