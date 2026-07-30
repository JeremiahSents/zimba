import "server-only"
import { type DocumentProps, renderToBuffer } from "@react-pdf/renderer"
import { createElement, type ReactElement } from "react"
import type { PaymentVoucherData, ReceiptDocumentData } from "./types"

/**
 * `renderToBuffer` is typed to take a `<Document>` element directly, so it
 * rejects a component that merely *returns* one. Both templates render a
 * `<Document>` at their root, which is the guarantee the signature is really
 * after; TypeScript just cannot see through the component boundary.
 */
type DocumentElement = ReactElement<DocumentProps>

/**
 * The templates are pulled in dynamically, mirroring how `email.ts` loads its
 * React Email templates. @react-pdf/renderer drags pdfkit and fontkit behind it
 * — roughly 15 MB — and that cost should land the first time someone actually
 * renders a PDF, not on every import of this package.
 */

export async function renderReceiptPdf(
  data: ReceiptDocumentData
): Promise<Buffer> {
  const { ReceiptDocument } = await import("./documents/receipt-document")
  return renderToBuffer(
    createElement(ReceiptDocument, { data }) as DocumentElement
  )
}

export async function renderPaymentVoucherPdf(
  data: PaymentVoucherData
): Promise<Buffer> {
  const { PaymentVoucherDocument } = await import(
    "./documents/payment-voucher-document"
  )
  return renderToBuffer(
    createElement(PaymentVoucherDocument, { data }) as DocumentElement
  )
}
