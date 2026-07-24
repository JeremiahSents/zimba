"use server"

import {
  recordPlatformAuditUseCase,
  requestOwnershipTransferUseCase,
} from "@workspace/api"
import { apiDatabase } from "@workspace/api-runtime"
import { revalidatePath } from "next/cache"
import { requireSession } from "@/core/auth/service"

export async function requestOwnershipTransfer(formData: FormData) {
  const session = await requireSession()
  const toUserId = String(formData.get("toUserId") ?? "")
  const reason = String(formData.get("reason") ?? "").trim()

  if (!toUserId) return { error: "Select a team member." }

  try {
    await requestOwnershipTransferUseCase(
      { userId: session.user.id },
      apiDatabase,
      {
        organizationId: session.organization.organizationId,
        toUserId,
        reason: reason || undefined,
      }
    )
    await recordPlatformAuditUseCase(apiDatabase, {
      actorId: session.user.id,
      targetUserId: toUserId,
      operation: "ownership_transfer_requested",
      metadata: {
        organizationId: session.organization.organizationId,
        toUserId,
        reason: reason || null,
      },
    }).catch((error: unknown) => {
      console.error("Audit log failed", error)
    })
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Could not submit transfer request.",
    }
  }

  revalidatePath("/settings")
  return { success: true }
}
