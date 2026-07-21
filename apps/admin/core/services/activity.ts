import "server-only"
import { db } from "@workspace/db"
import { activityEvent, organization, user } from "@workspace/db/schema"
import { desc, eq } from "drizzle-orm"

export async function getRecentActivity(limit = 10) {
  const rows = await db
    .select({
      id: activityEvent.id,
      action: activityEvent.action,
      entityType: activityEvent.entityType,
      entityId: activityEvent.entityId,
      metadata: activityEvent.metadata,
      createdAt: activityEvent.createdAt,
      organizationName: organization.name,
      actorName: user.name,
    })
    .from(activityEvent)
    .innerJoin(organization, eq(activityEvent.organizationId, organization.id))
    .leftJoin(user, eq(activityEvent.actorId, user.id))
    .orderBy(desc(activityEvent.createdAt))
    .limit(limit)

  return rows.map((r) => ({
    ...r,
    actorName: r.actorName ?? "System",
  }))
}

export async function listPlatformActivityEvents() {
  return getRecentActivity(100)
}
