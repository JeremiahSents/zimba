import { jsonb, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core"

import { user } from "../auth/schema"
import { organization } from "../organizations/schema"

/**
 * One log for both kinds of history. `kind` separates the two:
 * "audit" rows record who changed what; "activity" rows feed the activity feed
 * and may have no actor (system events).
 */
export const auditLog = pgTable("audit_log", {
  id: varchar("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organizationId: varchar("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  actorId: text("actor_id").references(() => user.id, { onDelete: "set null" }),
  kind: varchar("kind").notNull().default("audit"),
  action: varchar("action").notNull(),
  entityType: varchar("entity_type").notNull(),
  entityId: varchar("entity_id").notNull(),
  changes: jsonb("changes").$type<Record<string, unknown>>(),
  /**
   * Set when the actor was platform staff acting through a workspace grant
   * rather than a real member. Deliberately not a foreign key: the audit trail
   * has to outlive the grant row it refers to.
   */
  viaGrantId: varchar("via_grant_id"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})
