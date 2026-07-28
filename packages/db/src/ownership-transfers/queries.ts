import { count, desc, eq } from "drizzle-orm"
import { alias } from "drizzle-orm/pg-core"
import { user } from "../auth/schema"
import { organization } from "../organizations/schema"
import type { DatabaseExecutor } from "../shared/executor"
import { ownershipTransfer } from "./schema"

const fromUser = alias(user, "from_user")
const toUser = alias(user, "to_user")

export function createOwnershipTransferRequest(
  executor: DatabaseExecutor,
  data: typeof ownershipTransfer.$inferInsert
) {
  return executor.insert(ownershipTransfer).values(data)
}

export function findOwnershipTransferRequestById(
  executor: DatabaseExecutor,
  id: string
) {
  return executor
    .select()
    .from(ownershipTransfer)
    .where(eq(ownershipTransfer.id, id))
    .limit(1)
}

export function findPendingOwnershipTransferForOrg(
  executor: DatabaseExecutor,
  organizationId: string
) {
  return executor
    .select({
      id: ownershipTransfer.id,
      status: ownershipTransfer.status,
    })
    .from(ownershipTransfer)
    .where(eq(ownershipTransfer.organizationId, organizationId))
    .orderBy(desc(ownershipTransfer.createdAt))
    .limit(1)
}

export async function listOwnershipTransferRequests(
  executor: DatabaseExecutor
) {
  return executor
    .select({
      id: ownershipTransfer.id,
      organizationId: ownershipTransfer.organizationId,
      organizationName: organization.name,
      fromUserId: ownershipTransfer.fromUserId,
      fromUserName: fromUser.name,
      fromUserEmail: fromUser.email,
      toUserId: ownershipTransfer.toUserId,
      toUserName: toUser.name,
      toUserEmail: toUser.email,
      status: ownershipTransfer.status,
      reason: ownershipTransfer.reason,
      reviewedBy: ownershipTransfer.reviewedBy,
      reviewedAt: ownershipTransfer.reviewedAt,
      rejectionReason: ownershipTransfer.rejectionReason,
      createdAt: ownershipTransfer.createdAt,
    })
    .from(ownershipTransfer)
    .innerJoin(
      organization,
      eq(organization.id, ownershipTransfer.organizationId)
    )
    .innerJoin(fromUser, eq(fromUser.id, ownershipTransfer.fromUserId))
    .innerJoin(toUser, eq(toUser.id, ownershipTransfer.toUserId))
    .orderBy(desc(ownershipTransfer.createdAt))
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
    .update(ownershipTransfer)
    .set({
      status: data.status,
      reviewedBy: data.reviewedBy,
      reviewedAt: data.reviewedAt,
      rejectionReason: data.rejectionReason ?? null,
      updatedAt: new Date(),
    })
    .where(eq(ownershipTransfer.id, id))
    .returning()
  return updated ?? null
}

export async function countPendingOwnershipTransfers(
  executor: DatabaseExecutor
) {
  const [row] = await executor
    .select({ value: count() })
    .from(ownershipTransfer)
    .where(eq(ownershipTransfer.status, "pending"))
  return Number(row?.value ?? 0)
}
