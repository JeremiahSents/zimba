"use server"

import {
  approveOwnershipTransferUseCase,
  listOwnershipTransferRequestsUseCase,
  rejectOwnershipTransferUseCase,
} from "@workspace/api"
import { apiDatabase } from "@workspace/api-runtime"
import { sendOwnershipTransferEmail } from "@workspace/transactional"
import { revalidatePath } from "next/cache"
import { requirePlatformSession } from "@/core/auth/service"

async function getTransfer(transferId: string) {
  const transfers = await listOwnershipTransferRequestsUseCase(apiDatabase)
  return transfers.find((transfer) => transfer.id === transferId) ?? null
}

export async function approveTransfer(formData: FormData) {
  const session = await requirePlatformSession()
  const transferId = String(formData.get("transferId") ?? "")
  if (!transferId) return

  const transfer = await getTransfer(transferId)
  await approveOwnershipTransferUseCase(
    { reviewerId: session.user.id },
    apiDatabase,
    transferId
  )
  if (transfer) {
    await Promise.allSettled(
      [transfer.fromUserEmail, transfer.toUserEmail].map((to) =>
        sendOwnershipTransferEmail({
          to,
          organizationName: transfer.organizationName,
          fromUserName: transfer.fromUserName,
          toUserName: transfer.toUserName,
          status: "approved",
          reason: transfer.reason ?? undefined,
        })
      )
    ).then((results) => {
      results.forEach((result) => {
        if (result.status === "rejected")
          console.error(
            "Ownership transfer approval email failed",
            result.reason
          )
      })
    })
  }

  revalidatePath("/transfers")
  revalidatePath("/overview")
}

export async function rejectTransfer(formData: FormData) {
  const session = await requirePlatformSession()
  const transferId = String(formData.get("transferId") ?? "")
  const rejectionReason = String(formData.get("rejectionReason") ?? "").trim()
  if (!transferId) return

  const transfer = await getTransfer(transferId)
  await rejectOwnershipTransferUseCase(
    { reviewerId: session.user.id },
    apiDatabase,
    transferId,
    rejectionReason || undefined
  )
  if (transfer) {
    await Promise.allSettled(
      [transfer.fromUserEmail, transfer.toUserEmail].map((to) =>
        sendOwnershipTransferEmail({
          to,
          organizationName: transfer.organizationName,
          fromUserName: transfer.fromUserName,
          toUserName: transfer.toUserName,
          status: "rejected",
          reason: transfer.reason ?? undefined,
          rejectionReason: rejectionReason || undefined,
        })
      )
    ).then((results) => {
      results.forEach((result) => {
        if (result.status === "rejected")
          console.error(
            "Ownership transfer rejection email failed",
            result.reason
          )
      })
    })
  }

  revalidatePath("/transfers")
  revalidatePath("/overview")
}
