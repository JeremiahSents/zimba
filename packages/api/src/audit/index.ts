import type { DatabaseExecutor } from "@workspace/db/repositories"
import { appendAuditEvent } from "@workspace/db/repositories"
import { z } from "zod"
import type { WorkspaceContext } from "../shared/workspace-context"

const auditInputSchema = z.object({
  action: z.string().trim().min(1).max(120),
  entityType: z.string().trim().min(1).max(120),
  entityId: z.string().trim().min(1).max(240),
  changes: z.record(z.string(), z.unknown()).optional(),
})

export function recordAuditUseCase(
  ctx: Pick<WorkspaceContext, "organizationId" | "userId">,
  deps: { executor: DatabaseExecutor },
  rawInput: unknown
) {
  const input = auditInputSchema.parse(rawInput)
  return appendAuditEvent(deps.executor, {
    organizationId: ctx.organizationId,
    actorId: ctx.userId,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    changes: input.changes,
  })
}
