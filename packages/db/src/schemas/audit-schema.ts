import { jsonb, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core"

import { user } from "./auth-schema"
import { organization } from "./organization-schema"

export const auditLog = pgTable("audit_log", {
  id: varchar("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organizationId: varchar("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  actorId: text("actor_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  action: varchar("action").notNull(),
  entityType: varchar("entity_type").notNull(),
  entityId: varchar("entity_id").notNull(),
  changes: jsonb("changes").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

export const activityEvent = pgTable("activity_event", {
  id: varchar("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organizationId: varchar("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  actorId: text("actor_id").references(() => user.id, { onDelete: "set null" }),
  action: varchar("action").notNull(),
  entityType: varchar("entity_type").notNull(),
  entityId: varchar("entity_id").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

export const auditEvent = auditLog
