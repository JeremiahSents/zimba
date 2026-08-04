import { db } from "@workspace/db"

import {
  countOrganizationOwners,
  deleteMemberFromOrganization,
  findMemberInOrganization,
} from "@workspace/db/organizations"
import { z } from "zod"
import {
  conflictError,
  forbidden,
  notFoundError,
  validationError,
} from "../shared/application-error"
import type { WorkspaceContext } from "../shared/workspace-context"

const memberIdSchema = z.string().trim().min(1)

/**
 * The read and the delete share one transaction on purpose: two owners removing
 * each other at the same moment would both read "2 owners" and both succeed,
 * leaving the workspace ownerless.
 */
export async function removeMemberUseCase(
  ctx: Pick<WorkspaceContext, "organizationId" | "userId" | "role">,
  rawMemberId: unknown
) {
  const input = memberIdSchema.safeParse(rawMemberId)
  if (!input.success) validationError("Member id is required.")
  if (ctx.role !== "owner")
    forbidden("Only an owner can remove members from this workspace.")

  return db.transaction(async (tx) => {
    const target = await findMemberInOrganization(
      tx,
      ctx.organizationId,
      input.data
    )
    if (!target) notFoundError("That member is not part of this workspace.")

    if (target.userId === ctx.userId)
      forbidden(
        "You cannot remove yourself. Transfer ownership first if you want to leave."
      )

    if (
      target.role === "owner" &&
      (await countOrganizationOwners(tx, ctx.organizationId)) <= 1
    )
      conflictError(
        "This is the only owner. Promote another owner before removing this one."
      )

    const removed = await deleteMemberFromOrganization(
      tx,
      ctx.organizationId,
      input.data
    )
    if (!removed) notFoundError("That member has already been removed.")
    return removed
  })
}
