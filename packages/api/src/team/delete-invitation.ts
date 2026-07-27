import { db } from "@workspace/db"

import { deleteInvitationForOrganization } from "@workspace/db/repositories"
import { z } from "zod"
import { validationError } from "../shared/application-error"
import type { WorkspaceContext } from "../shared/workspace-context"

const invitationIdSchema = z.string().trim().min(1)

export async function deleteInvitationUseCase(
  ctx: Pick<WorkspaceContext, "organizationId">,
  rawInvitationId: unknown
) {
  const input = invitationIdSchema.safeParse(rawInvitationId)
  if (!input.success) validationError("Invitation id is required.")

  const [deleted] = await deleteInvitationForOrganization(
    db,
    ctx.organizationId,
    input.data
  )
  return deleted ?? null
}
