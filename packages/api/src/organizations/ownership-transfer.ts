import type { OwnershipTransferRequestDto } from "@workspace/contracts"
import type {
  DatabaseExecutor,
  TransactionRunner,
} from "@workspace/db/repositories"
import {
  countPendingOwnershipTransfers,
  createOwnershipTransferRequest,
  findMembershipByUserAndOrganization,
  findOwnershipTransferRequestById,
  findPendingOwnershipTransferForOrg,
  listOwnershipTransferRequests,
  updateMemberRole,
  updateOwnershipTransferRequestStatus,
} from "@workspace/db/repositories"
import {
  conflictError,
  forbidden,
  notFoundError,
  validationError,
} from "../shared/application-error"

export async function requestOwnershipTransferUseCase(
  ctx: { userId: string },
  deps: { executor: DatabaseExecutor },
  input: {
    organizationId: string
    toUserId: string
    reason?: string
  }
): Promise<void> {
  if (ctx.userId === input.toUserId)
    validationError("You cannot transfer ownership to yourself.")

  const fromMembership = await findMembershipByUserAndOrganization(
    deps.executor,
    ctx.userId,
    input.organizationId
  )
  if (fromMembership?.role !== "owner")
    forbidden("Only the current owner can request a transfer.")

  const toMembership = await findMembershipByUserAndOrganization(
    deps.executor,
    input.toUserId,
    input.organizationId
  )
  if (!toMembership)
    notFoundError("The target user is not a member of this organization.")

  const [existing] = await findPendingOwnershipTransferForOrg(
    deps.executor,
    input.organizationId
  )
  if (existing && existing.status === "pending")
    conflictError(
      "There is already a pending transfer request for this organization."
    )

  await createOwnershipTransferRequest(deps.executor, {
    organizationId: input.organizationId,
    fromUserId: ctx.userId,
    toUserId: input.toUserId,
    status: "pending",
    reason: input.reason || null,
  })
}

export async function listOwnershipTransferRequestsUseCase(deps: {
  executor: DatabaseExecutor
}): Promise<OwnershipTransferRequestDto[]> {
  const rows = await listOwnershipTransferRequests(deps.executor)
  return rows.map((row) => ({
    id: row.id,
    organizationId: row.organizationId,
    organizationName: row.organizationName,
    fromUserId: row.fromUserId,
    fromUserName: row.fromUserName,
    fromUserEmail: row.fromUserEmail,
    toUserId: row.toUserId,
    toUserName: row.toUserName,
    toUserEmail: row.toUserEmail,
    status: row.status as OwnershipTransferRequestDto["status"],
    reason: row.reason,
    reviewedBy: row.reviewedBy,
    reviewedAt: row.reviewedAt,
    rejectionReason: row.rejectionReason,
    createdAt: row.createdAt,
  }))
}

export async function approveOwnershipTransferUseCase(
  ctx: { reviewerId: string },
  deps: { executor: DatabaseExecutor; transaction: TransactionRunner },
  transferId: string
): Promise<void> {
  const [transfer] = await findOwnershipTransferRequestById(
    deps.executor,
    transferId
  )
  if (!transfer) notFoundError("Transfer request not found.")
  if (transfer.status !== "pending")
    conflictError("This transfer request has already been reviewed.")

  return deps.transaction(async (tx) => {
    const fromMembership = await findMembershipByUserAndOrganization(
      tx,
      transfer.fromUserId,
      transfer.organizationId
    )
    if (fromMembership?.role !== "owner")
      forbidden("The requesting user is no longer the owner.")

    const toMembership = await findMembershipByUserAndOrganization(
      tx,
      transfer.toUserId,
      transfer.organizationId
    )
    if (!toMembership)
      notFoundError(
        "The target user is no longer a member of this organization."
      )

    await updateMemberRole(tx, fromMembership.id, "site_manager")
    await updateMemberRole(tx, toMembership.id, "owner")

    await updateOwnershipTransferRequestStatus(tx, transferId, {
      status: "approved",
      reviewedBy: ctx.reviewerId,
      reviewedAt: new Date(),
    })
  })
}

export async function rejectOwnershipTransferUseCase(
  ctx: { reviewerId: string },
  deps: { executor: DatabaseExecutor },
  transferId: string,
  rejectionReason?: string
): Promise<void> {
  const [transfer] = await findOwnershipTransferRequestById(
    deps.executor,
    transferId
  )
  if (!transfer) notFoundError("Transfer request not found.")
  if (transfer.status !== "pending")
    conflictError("This transfer request has already been reviewed.")

  await updateOwnershipTransferRequestStatus(deps.executor, transferId, {
    status: "rejected",
    reviewedBy: ctx.reviewerId,
    reviewedAt: new Date(),
    rejectionReason: rejectionReason || null,
  })
}

export async function getPendingTransferCountUseCase(deps: {
  executor: DatabaseExecutor
}): Promise<number> {
  return countPendingOwnershipTransfers(deps.executor)
}
