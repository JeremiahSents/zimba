const MAX_RECEIPT_IMAGE_SIZE = 4 * 1024 * 1024
const MAX_RECEIPT_PDF_SIZE = 16 * 1024 * 1024
const RECEIPT_FILE_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
])

export function validateReceiptFile(file: Pick<File, "size" | "type">) {
  if (!RECEIPT_FILE_TYPES.has(file.type)) {
    return "Upload a PDF, JPEG, or PNG receipt."
  }

  const maxSize =
    file.type === "application/pdf"
      ? MAX_RECEIPT_PDF_SIZE
      : MAX_RECEIPT_IMAGE_SIZE

  if (file.size > maxSize) {
    return file.type === "application/pdf"
      ? "PDF receipts must be 16 MB or smaller."
      : "Receipt images must be 4 MB or smaller."
  }

  return null
}
