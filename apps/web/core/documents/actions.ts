"use server"

import { idSchema } from "@workspace/api"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { ensureActionSession } from "@/core/auth/action-session"
import { getWorkspaceSlug } from "@/core/auth/workspace-slug"
import { recordDocumentEmailAudit } from "@/core/documents/audit"
import {
  generatePaymentVoucher,
  generateReceiptDocument,
  sendDocumentEmail,
} from "@/core/documents/service"
import {
  type ActionResult,
  expectedActionFailure,
} from "@/core/shared/action-result"
import { handleActionError } from "@/core/shared/handle-action-error"

export async function generateReceiptDocumentAction(
  receiptId: string,
  projectId: string
): Promise<ActionResult> {
  const authFailure = await ensureActionSession("documents.generate-receipt")
  if (authFailure) return authFailure
  if (!idSchema.safeParse(receiptId).success)
    return expectedActionFailure("VALIDATION_FAILED", "Invalid receipt.")

  try {
    await generateReceiptDocument(receiptId, { force: true })
    await revalidateDocumentRoutes(receiptId, projectId)
    return { success: true, data: undefined }
  } catch (error) {
    return handleActionError(error, "documents.generate-receipt")
  }
}

export async function generatePaymentVoucherAction(
  paymentId: string,
  receiptId: string,
  projectId: string
): Promise<ActionResult> {
  const authFailure = await ensureActionSession("documents.generate-voucher")
  if (authFailure) return authFailure
  if (![paymentId, receiptId].every((id) => idSchema.safeParse(id).success))
    return expectedActionFailure("VALIDATION_FAILED", "Invalid payment.")

  try {
    await generatePaymentVoucher(paymentId, { force: true })
    await revalidateDocumentRoutes(receiptId, projectId)
    return { success: true, data: undefined }
  } catch (error) {
    return handleActionError(error, "documents.generate-voucher")
  }
}

const sendSchema = z.object({
  kind: z.enum(["receipt", "payment_voucher"]),
  targetId: idSchema,
  receiptId: idSchema,
  recipient: z.enum(["self", "supplier"]),
  // Free text from the client, so it is validated here rather than trusted.
  // Ignored entirely when `recipient` is "self" — see the service.
  email: z.email().max(320).or(z.literal("")),
})

export async function sendDocumentEmailAction(input: {
  kind: "receipt" | "payment_voucher"
  targetId: string
  receiptId: string
  projectId: string
  recipient: "self" | "supplier"
  email: string
}): Promise<ActionResult<{ to: string }>> {
  const authFailure = await ensureActionSession("documents.send-email")
  if (authFailure) return authFailure

  const parsed = sendSchema.safeParse(input)
  if (!parsed.success)
    return expectedActionFailure(
      "VALIDATION_FAILED",
      "Enter a valid email address."
    )
  if (parsed.data.recipient === "supplier" && !parsed.data.email)
    return expectedActionFailure(
      "VALIDATION_FAILED",
      "Enter the supplier's email address."
    )

  try {
    const { to } = await sendDocumentEmail({
      kind: parsed.data.kind,
      targetId: parsed.data.targetId,
      recipient: parsed.data.recipient,
      email: parsed.data.email,
    })
    // Something addressed to a third party left the building; there should be a
    // record of who sent it and where.
    await recordDocumentEmailAudit({
      kind: parsed.data.kind,
      targetId: parsed.data.targetId,
      recipient: parsed.data.recipient,
      email: to,
    })
    return { success: true, data: { to } }
  } catch (error) {
    return handleActionError(error, "documents.send-email")
  }
}

async function revalidateDocumentRoutes(receiptId: string, projectId: string) {
  const slug = await getWorkspaceSlug()
  revalidatePath(`/${slug}/expenses/receipts/${receiptId}`)
  revalidatePath(`/${slug}/expenses`)
  if (idSchema.safeParse(projectId).success)
    revalidatePath(`/${slug}/projects/${projectId}`)
}
