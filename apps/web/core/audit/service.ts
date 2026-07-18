import "server-only"
import { db, schema } from "../shared/db"

export async function recordAudit(input: { organizationId: string; actorId: string; action: string; entityType: string; entityId: string; changes?: Record<string, unknown> }) {
  await db.insert(schema.auditEvent).values(input)
}
