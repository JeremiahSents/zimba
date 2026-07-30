/**
 * The data contract for every generated PDF.
 *
 * Deliberately plain: only strings, numbers, nulls, and arrays of those. No
 * `Date`, no React, no database rows. Two reasons — the caller building this is
 * an app service that must not leak Drizzle types into a rendering package, and
 * a fixture for these types can be written by hand in a test.
 *
 * Money is integer cents, matching the database, so nothing here can drift the
 * way a float would. Dates are ISO strings; `format.ts` renders both.
 */

export type PdfParty = {
  name: string
  email: string | null
  phone: string | null
}

export type PdfLine = {
  description: string
  allocationName: string
  quantity: number
  unitRateCents: number
  amountCents: number
}

export type PdfPaymentRow = {
  amountCents: number
  currency: string
  method: string
  reference: string | null
  paidAt: string
}

export type PdfSettlementStatus = "unpaid" | "partially_paid" | "paid"

export type ReceiptDocumentData = {
  documentNumber: string
  /** When the PDF itself was produced, not when the expense was incurred. */
  issuedAt: string
  expenseDate: string | null
  currency: string
  organization: PdfParty
  supplier: PdfParty
  projectName: string | null
  lines: PdfLine[]
  totalCents: number
  paidCents: number
  outstandingCents: number
  settlementStatus: PdfSettlementStatus
  payments: PdfPaymentRow[]
}

export type PaymentVoucherData = {
  voucherNumber: string
  issuedAt: string
  paidAt: string
  amountCents: number
  currency: string
  method: string
  reference: string | null
  organization: PdfParty
  supplier: PdfParty
  projectName: string | null
  /** The receipt or payable this payment settles, when there is one. */
  againstDocumentNumber: string | null
  againstTotalCents: number | null
  /** Balance on that parent *after* this payment. */
  runningPaidCents: number | null
  runningOutstandingCents: number | null
}
