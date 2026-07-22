import "server-only"
import { db } from "@workspace/db"
import { appendAuditEvent } from "@workspace/db/repositories"

export async function recordAudit(input: { organizationId: string; actorId: string; action: string; entityType: string; entityId: string; changes?: Record<string, unknown> }) {
  await appendAuditEvent(db, input)
}
