import { jsonb, pgTable, timestamp, varchar } from "drizzle-orm/pg-core"
import { organization } from "../organizations/schema"
import { user } from "../auth/schema"

export const auditEvent = pgTable("audit_event", {
  id: varchar("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  organizationId: varchar("organization_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  actorId: varchar("actor_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  action: varchar("action").notNull(),
  entityType: varchar("entity_type").notNull(),
  entityId: varchar("entity_id").notNull(),
  changes: jsonb("changes").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})
