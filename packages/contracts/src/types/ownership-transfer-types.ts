export type OwnershipTransferStatus =
  | "pending"
  | "approved"
  | "rejected"

export type OwnershipTransferRequestDto = {
  id: string
  organizationId: string
  organizationName: string
  fromUserId: string
  fromUserName: string
  fromUserEmail: string
  toUserId: string
  toUserName: string
  toUserEmail: string
  status: OwnershipTransferStatus
  reason: string | null
  reviewedBy: string | null
  reviewedAt: Date | null
  rejectionReason: string | null
  createdAt: Date
}
