import "server-only"
import { recordAuditUseCase } from "@workspace/api"
import { db } from "@workspace/db"

export async function recordAudit(input: {
  organizationId: string
  actorId: string
  action: string
  entityType: string
  entityId: string
  changes?: Record<string, unknown>
}) {
  await recordAuditUseCase(
    { organizationId: input.organizationId, userId: input.actorId },
    { executor: db },
    {
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      changes: input.changes,
    }
  )
}
