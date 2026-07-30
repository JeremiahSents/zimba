import { db } from "@workspace/db"

import { appendAuditEvent } from "@workspace/db/audit"
import { createUploadedFile } from "@workspace/db/files"
import {
  attachPaymentDocument,
  attachReceiptDocument,
} from "@workspace/db/receipts"
import { z } from "zod"
import { notFoundError, validationError } from "../shared/application-error"
import { requireRole } from "../shared/authorization"
import type { WorkspaceContext } from "../shared/workspace-context"

/**
 * `expense_receipt` already means "photo of the supplier's paper receipt", so
 * generated output gets its own purposes. Keeping them distinct is what lets
 * `findCompletedFile(..., "expense_receipt")` stay honest, and what makes a
 * sweep for superseded documents possible later.
 */
export const RECEIPT_DOCUMENT_PURPOSE = "receipt_document"
export const PAYMENT_VOUCHER_PURPOSE = "payment_voucher"

const storeGeneratedDocumentSchema = z.object({
  target: z.object({
    kind: z.enum(["receipt", "payment"]),
    id: z.string().trim().min(1),
  }),
  key: z.string().trim().min(1),
  url: z.string().trim().url(),
  filename: z.string().trim().min(1).max(512),
  contentType: z.string().trim().min(1).max(255),
  sizeBytes: z.number().int().nonnegative(),
})

export type StoreGeneratedDocumentInput = z.infer<
  typeof storeGeneratedDocumentSchema
>

/**
 * Records an already-uploaded PDF and points its receipt or payment at it.
 *
 * The file row and the foreign key are written in one transaction on purpose:
 * split across two calls there is a window where the file exists and nothing
 * references it, which is an orphan no retry would ever clean up.
 *
 * Uploading is the caller's job — it needs the storage client and its token,
 * neither of which belong in this layer.
 */
export async function storeGeneratedDocumentUseCase(
  ctx: WorkspaceContext,
  rawInput: unknown
) {
  requireRole(ctx.role, ["owner", "site_manager", "accountant"])
  const input = storeGeneratedDocumentSchema.safeParse(rawInput)
  if (!input.success) validationError("Invalid generated document.")

  const { target } = input.data
  const isReceipt = target.kind === "receipt"

  return db.transaction(async (tx) => {
    const stored = await createUploadedFile(tx, {
      organizationId: ctx.organizationId,
      uploaderId: ctx.userId,
      key: input.data.key,
      url: input.data.url,
      filename: input.data.filename,
      contentType: input.data.contentType,
      sizeBytes: input.data.sizeBytes,
      purpose: isReceipt ? RECEIPT_DOCUMENT_PURPOSE : PAYMENT_VOUCHER_PURPOSE,
      status: "completed",
    })
    if (!stored) validationError("The generated document could not be saved.")

    const attached = isReceipt
      ? await attachReceiptDocument(
          tx,
          ctx.organizationId,
          target.id,
          stored.id
        )
      : await attachPaymentDocument(
          tx,
          ctx.organizationId,
          target.id,
          stored.id
        )
    // The attach is org-scoped, so a miss means the target belongs to someone
    // else — the transaction rolls back and the file row goes with it.
    if (!attached)
      notFoundError(isReceipt ? "Receipt not found." : "Payment not found.")

    await appendAuditEvent(tx, {
      organizationId: ctx.organizationId,
      actorId: ctx.userId,
      action: isReceipt
        ? "receipt.document_generated"
        : "payment.document_generated",
      entityType: isReceipt ? "expense" : "payment",
      entityId: target.id,
      changes: { fileId: stored.id, key: stored.key },
      viaGrantId: ctx.viaGrantId ?? null,
    })

    return { fileId: stored.id, url: stored.url, filename: stored.filename }
  })
}
