import { count, desc, eq } from "drizzle-orm"
import { alias } from "drizzle-orm/pg-core"
import { user } from "../schemas/auth-schema"
import { organization } from "../schemas/organization-schema"
import { ownershipTransferRequest } from "../schemas/ownership-transfer-schema"
import type { DatabaseExecutor } from "./types"

const fromUser = alias(user, "from_user")
const toUser = alias(user, "to_user")

export function createOwnershipTransferRequest(
  executor: DatabaseExecutor,
  data: typeof ownershipTransferRequest.$inferInsert
) {
  return executor.insert(ownershipTransferRequest).values(data)
}

export function findOwnershipTransferRequestById(
  executor: DatabaseExecutor,
  id: string
) {
  return executor
    .select()
    .from(ownershipTransferRequest)
    .where(eq(ownershipTransferRequest.id, id))
    .limit(1)
}

export function findPendingOwnershipTransferForOrg(
  executor: DatabaseExecutor,
  organizationId: string
) {
  return executor
    .select({
      id: ownershipTransferRequest.id,
      status: ownershipTransferRequest.status,
    })
    .from(ownershipTransferRequest)
    .where(eq(ownershipTransferRequest.organizationId, organizationId))
    .orderBy(desc(ownershipTransferRequest.createdAt))
    .limit(1)
}

export async function listOwnershipTransferRequests(
  executor: DatabaseExecutor
) {
  return executor
    .select({
      id: ownershipTransferRequest.id,
      organizationId: ownershipTransferRequest.organizationId,
      organizationName: organization.name,
      fromUserId: ownershipTransferRequest.fromUserId,
      fromUserName: fromUser.name,
      fromUserEmail: fromUser.email,
      toUserId: ownershipTransferRequest.toUserId,
      toUserName: toUser.name,
      toUserEmail: toUser.email,
      status: ownershipTransferRequest.status,
      reason: ownershipTransferRequest.reason,
      reviewedBy: ownershipTransferRequest.reviewedBy,
      reviewedAt: ownershipTransferRequest.reviewedAt,
      rejectionReason: ownershipTransferRequest.rejectionReason,
      createdAt: ownershipTransferRequest.createdAt,
    })
    .from(ownershipTransferRequest)
    .innerJoin(
      organization,
      eq(organization.id, ownershipTransferRequest.organizationId)
    )
    .innerJoin(fromUser, eq(fromUser.id, ownershipTransferRequest.fromUserId))
    .innerJoin(toUser, eq(toUser.id, ownershipTransferRequest.toUserId))
    .orderBy(desc(ownershipTransferRequest.createdAt))
}

export async function updateOwnershipTransferRequestStatus(
  executor: DatabaseExecutor,
  id: string,
  data: {
    status: string
    reviewedBy: string
    reviewedAt: Date
    rejectionReason?: string | null
  }
) {
  const [updated] = await executor
    .update(ownershipTransferRequest)
    .set({
      status: data.status,
      reviewedBy: data.reviewedBy,
      reviewedAt: data.reviewedAt,
      rejectionReason: data.rejectionReason ?? null,
      updatedAt: new Date(),
    })
    .where(eq(ownershipTransferRequest.id, id))
    .returning()
  return updated ?? null
}

export async function countPendingOwnershipTransfers(
  executor: DatabaseExecutor
) {
  const [row] = await executor
    .select({ value: count() })
    .from(ownershipTransferRequest)
    .where(eq(ownershipTransferRequest.status, "pending"))
  return Number(row?.value ?? 0)
}
