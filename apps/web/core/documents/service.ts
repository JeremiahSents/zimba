import "server-only"

import {
  getExpenseDetailUseCase,
  getPaymentDetailUseCase,
  storeGeneratedDocumentUseCase,
  type WorkspaceRole,
} from "@workspace/api"
import { sendDocumentShareEmail } from "@workspace/transactional"
import {
  formatMoney,
  formatSettlementStatus,
  type PaymentVoucherData,
  type ReceiptDocumentData,
  renderPaymentVoucherPdf,
  renderReceiptPdf,
  toSafeFilename,
} from "@workspace/transactional/pdf"
import { UTApi, UTFile } from "uploadthing/server"
import { formatReceiptNumber } from "@/components/expenses/receipt-number"
import { requireSession } from "@/core/auth/service"
import { env } from "@/core/shared/env"
import { logApplicationError } from "@/core/shared/error-logger"
import { ApplicationError, notFound } from "@/core/shared/errors"

/**
 * Owns the whole lifecycle of a generated document: render it, put it in
 * storage, record it, and — separately — email it.
 *
 * The UploadThing client lives here rather than in `@workspace/api` because the
 * SDK and its token belong to this app; the use case layer has no env surface
 * and no third-party network clients. The database write still goes through a
 * use case, so the app → api → db arrow is intact.
 */

let utapi: UTApi | null = null
function getUploader(): UTApi {
  if (!utapi) utapi = new UTApi({ token: env.UPLOADTHING_TOKEN })
  return utapi
}

async function uploadPdf(buffer: Buffer, filename: string) {
  const uploaded = await getUploader().uploadFiles(
    new UTFile([new Uint8Array(buffer)], filename, {
      type: "application/pdf",
    })
  )
  if (uploaded.error || !uploaded.data) {
    throw new ApplicationError("UPLOAD_FAILED", undefined, {
      cause: uploaded.error,
    })
  }
  return uploaded.data
}

type Ctx = {
  userId: string
  organizationId: string
  organizationName: string
  role: WorkspaceRole
}

async function requireCtx(): Promise<Ctx> {
  const { user, organization } = await requireSession()
  return {
    userId: user.id,
    organizationId: organization.organizationId,
    organizationName: organization.organizationName,
    role: organization.role as WorkspaceRole,
  }
}

// ---------------------------------------------------------------- receipts

function toReceiptData(
  ctx: Ctx,
  detail: NonNullable<Awaited<ReturnType<typeof getExpenseDetailUseCase>>>
): ReceiptDocumentData {
  const totalCents = detail.lines.reduce(
    (sum, { line }) => sum + line.amountCents,
    0
  )
  const paidCents = detail.payments.reduce(
    (sum, payment) => sum + payment.amountCents,
    0
  )
  const outstandingCents = Math.max(0, totalCents - paidCents)

  return {
    documentNumber: formatReceiptNumber({
      fallbackId: detail.expense.id,
      organizationName: ctx.organizationName,
    }),
    issuedAt: new Date().toISOString(),
    expenseDate: detail.expense.expenseDate?.toISOString() ?? null,
    currency: "UGX",
    organization: { name: ctx.organizationName, email: null, phone: null },
    supplier: {
      name: detail.supplierName ?? "Unknown supplier",
      email: detail.supplierEmail ?? null,
      phone: detail.supplierPhone ?? null,
    },
    projectName: detail.projectName ?? null,
    lines: detail.lines.map(({ line, allocationName }) => ({
      description: line.itemDescription,
      allocationName: allocationName ?? "General",
      quantity: line.quantity,
      unitRateCents: line.unitRateCents,
      amountCents: line.amountCents,
    })),
    totalCents,
    paidCents,
    outstandingCents,
    settlementStatus:
      paidCents >= totalCents && totalCents > 0
        ? "paid"
        : paidCents > 0
          ? "partially_paid"
          : "unpaid",
    payments: detail.payments.map((payment) => ({
      amountCents: payment.amountCents,
      currency: payment.currency,
      method: payment.method ?? "other",
      reference: payment.reference,
      paidAt: (payment.paymentDate ?? payment.createdAt).toISOString(),
    })),
  }
}

export async function generateReceiptDocument(
  receiptId: string,
  options: { force?: boolean } = {}
) {
  const ctx = await requireCtx()
  const detail = await getExpenseDetailUseCase(
    { organizationId: ctx.organizationId },
    receiptId
  )
  if (!detail) notFound("Receipt not found.")

  // Without this a double-submitted create would upload the same PDF twice.
  // The payment flows pass `force` because the totals genuinely changed.
  if (detail.expense.documentFileId && !options.force) {
    return { fileId: detail.expense.documentFileId, regenerated: false }
  }

  const data = toReceiptData(ctx, detail)
  const buffer = await renderReceiptPdf(data)
  const uploaded = await uploadPdf(
    buffer,
    `${toSafeFilename(`Receipt-${data.documentNumber}`)}.pdf`
  )

  const stored = await storeGeneratedDocumentUseCase(ctx, {
    target: { kind: "receipt", id: receiptId },
    key: uploaded.key,
    url: uploaded.ufsUrl,
    filename: uploaded.name,
    contentType: "application/pdf",
    sizeBytes: uploaded.size,
  })
  return { fileId: stored.fileId, regenerated: true }
}

// ---------------------------------------------------------------- payments

function toVoucherData(
  ctx: Ctx,
  detail: NonNullable<Awaited<ReturnType<typeof getPaymentDetailUseCase>>>
): PaymentVoucherData {
  const parentId = detail.payment.expenseId ?? detail.payment.payableId
  const parentTotalCents = detail.payment.expenseId
    ? detail.lines.reduce((sum, line) => sum + line.amountCents, 0)
    : (detail.payable?.amountCents ?? null)
  const paidCents = detail.siblings.reduce(
    (sum, sibling) => sum + sibling.amountCents,
    0
  )

  const parentNumber = parentId
    ? formatReceiptNumber({
        fallbackId: parentId,
        organizationName: ctx.organizationName,
      })
    : null

  return {
    // Derived from the payment's own id so two vouchers never collide, and
    // prefixed with the parent so the pair reads as related on paper.
    voucherNumber: parentNumber
      ? `${parentNumber}-P${detail.payment.id.slice(0, 4).toUpperCase()}`
      : formatReceiptNumber({
          fallbackId: detail.payment.id,
          organizationName: ctx.organizationName,
        }),
    issuedAt: new Date().toISOString(),
    paidAt: (
      detail.payment.paymentDate ?? detail.payment.createdAt
    ).toISOString(),
    amountCents: detail.payment.amountCents,
    currency: detail.payment.currency,
    method: detail.payment.method ?? "other",
    reference: detail.payment.reference,
    organization: { name: ctx.organizationName, email: null, phone: null },
    supplier: {
      name: detail.supplierName ?? "Unknown supplier",
      email: detail.supplierEmail ?? null,
      phone: detail.supplierPhone ?? null,
    },
    projectName: detail.projectName ?? null,
    againstDocumentNumber: parentNumber,
    againstTotalCents: parentTotalCents,
    runningPaidCents: parentTotalCents === null ? null : paidCents,
    runningOutstandingCents:
      parentTotalCents === null
        ? null
        : Math.max(0, parentTotalCents - paidCents),
  }
}

export async function generatePaymentVoucher(
  paymentId: string,
  options: { force?: boolean } = {}
) {
  const ctx = await requireCtx()
  const detail = await getPaymentDetailUseCase(
    { organizationId: ctx.organizationId },
    paymentId
  )
  if (!detail) notFound("Payment not found.")

  if (detail.payment.documentFileId && !options.force) {
    return { fileId: detail.payment.documentFileId, regenerated: false }
  }

  const data = toVoucherData(ctx, detail)
  const buffer = await renderPaymentVoucherPdf(data)
  const uploaded = await uploadPdf(
    buffer,
    `${toSafeFilename(`Voucher-${data.voucherNumber}`)}.pdf`
  )

  const stored = await storeGeneratedDocumentUseCase(ctx, {
    target: { kind: "payment", id: paymentId },
    key: uploaded.key,
    url: uploaded.ufsUrl,
    filename: uploaded.name,
    contentType: "application/pdf",
    sizeBytes: uploaded.size,
  })
  return { fileId: stored.fileId, regenerated: true }
}

// ------------------------------------------------- fire-and-forget wrappers

/**
 * Used by the create flows, which run *after* their transaction has committed.
 * A receipt that exists without its PDF is a far better outcome than a receipt
 * that failed to save because object storage was down, so nothing here throws —
 * the UI offers a Generate button for whatever did not make it.
 */
export async function generateDocumentsInBackground(targets: {
  receiptId?: string | null
  paymentId?: string | null
  force?: boolean
}) {
  const work: Promise<unknown>[] = []
  if (targets.receiptId)
    work.push(
      generateReceiptDocument(targets.receiptId, { force: targets.force })
    )
  if (targets.paymentId)
    work.push(
      generatePaymentVoucher(targets.paymentId, { force: targets.force })
    )
  if (!work.length) return

  const outcomes = await Promise.allSettled(work)
  for (const outcome of outcomes) {
    if (outcome.status === "rejected") {
      logApplicationError(outcome.reason, { operation: "documents.generate" })
    }
  }
}

// ------------------------------------------------------------------- email

export async function sendDocumentEmail(input: {
  kind: "receipt" | "payment_voucher"
  targetId: string
  recipient: "self" | "supplier"
  email: string
}) {
  const { user, organization } = await requireSession()
  const ctx: Ctx = {
    userId: user.id,
    organizationId: organization.organizationId,
    organizationName: organization.organizationName,
    role: organization.role as WorkspaceRole,
  }

  // Emailing a supplier sends an organisation's financial document to an
  // outside party. A viewer can read the workspace; they should not be able to
  // post from it.
  if (!["owner", "site_manager", "accountant"].includes(ctx.role)) {
    throw new ApplicationError("FORBIDDEN")
  }

  // Never take the client's word for "me". The address for a self-send is the
  // signed-in one, whatever the form submitted.
  const to = input.recipient === "self" ? user.email : input.email.trim()
  if (!to) throw new ApplicationError("VALIDATION_FAILED", "Enter an address.")

  const shared =
    input.kind === "receipt"
      ? await buildReceiptShare(ctx, input.targetId)
      : await buildVoucherShare(ctx, input.targetId)

  await sendDocumentShareEmail({
    ...shared,
    to,
    documentKind: input.kind,
    recipientKind: input.recipient,
    organizationName: ctx.organizationName,
    senderName: user.name || user.email,
    // Resend fetches the URL itself. The bytes are already in storage; pulling
    // them back through this process to base64 them would cost a round trip and
    // a third more payload for nothing.
    attachment: {
      filename: shared.attachmentFilename,
      path: shared.documentUrl,
      contentType: "application/pdf",
    },
  })

  return { to }
}

async function buildReceiptShare(ctx: Ctx, receiptId: string) {
  const detail = await getExpenseDetailUseCase(
    { organizationId: ctx.organizationId },
    receiptId
  )
  if (!detail) notFound("Receipt not found.")
  if (!detail.documentFile)
    throw new ApplicationError(
      "VALIDATION_FAILED",
      "Generate the PDF before emailing it."
    )

  const data = toReceiptData(ctx, detail)
  return {
    supplierName: data.supplier.name,
    projectName: data.projectName,
    documentNumber: data.documentNumber,
    documentUrl: detail.documentFile.url,
    attachmentFilename: detail.documentFile.filename,
    totalFormatted: formatMoney(data.totalCents, data.currency),
    outstandingFormatted:
      data.outstandingCents > 0
        ? formatMoney(data.outstandingCents, data.currency)
        : undefined,
    settlementLabel: formatSettlementStatus(data.settlementStatus),
  }
}

async function buildVoucherShare(ctx: Ctx, paymentId: string) {
  const detail = await getPaymentDetailUseCase(
    { organizationId: ctx.organizationId },
    paymentId
  )
  if (!detail) notFound("Payment not found.")
  if (!detail.documentFile)
    throw new ApplicationError(
      "VALIDATION_FAILED",
      "Generate the voucher before emailing it."
    )

  const data = toVoucherData(ctx, detail)
  return {
    supplierName: data.supplier.name,
    projectName: data.projectName,
    documentNumber: data.voucherNumber,
    documentUrl: detail.documentFile.url,
    attachmentFilename: detail.documentFile.filename,
    totalFormatted: formatMoney(data.amountCents, data.currency),
    outstandingFormatted:
      data.runningOutstandingCents && data.runningOutstandingCents > 0
        ? formatMoney(data.runningOutstandingCents, data.currency)
        : undefined,
    settlementLabel: undefined,
  }
}
