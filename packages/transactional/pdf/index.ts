/**
 * The PDF surface of @workspace/transactional.
 *
 * Only render functions and the plain data contract are exported — never the
 * React templates themselves. Anything importing `renderReceiptPdf` pulls in
 * `server-only`, so a client component that reaches for this fails the build
 * rather than shipping pdfkit to the browser.
 */
export {
  formatDocumentDate,
  formatMethod,
  formatMoney,
  formatSettlementStatus,
  toSafeFilename,
} from "./format"
export { renderPaymentVoucherPdf, renderReceiptPdf } from "./render"
export type {
  PaymentVoucherData,
  PdfLine,
  PdfParty,
  PdfPaymentRow,
  PdfSettlementStatus,
  ReceiptDocumentData,
} from "./types"
