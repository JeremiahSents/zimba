import { z } from "zod"
import { idSchema } from "./shared-zod"

export const ownershipTransferStatusSchema = z.enum([
  "pending",
  "approved",
  "rejected",
])

export const ownershipTransferRequestSchema = z.object({
  organizationId: idSchema,
  toUserId: idSchema,
  reason: z.string().max(2000).optional().or(z.literal("")),
})

export const ownershipTransferReviewSchema = z.object({
  transferId: idSchema,
  status: ownershipTransferStatusSchema,
  rejectionReason: z.string().max(2000).optional().or(z.literal("")),
})
