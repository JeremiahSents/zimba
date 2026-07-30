import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core"

import { user } from "../auth/schema"
import { organization } from "../organizations/schema"

export const platformUser = pgTable(
  "platform_user",
  {
    id: varchar("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: varchar("role").notNull().default("support"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("platform_user_user_unique").on(table.userId),
    index("platform_user_role_idx").on(table.role),
  ]
)

export const platformAuditLog = pgTable("platform_audit_log", {
  id: varchar("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  /**
   * Nullable on purpose. Cascading here would let a deleted super admin erase
   * their own history, which is the one thing an audit log may not do.
   */
  actorId: text("actor_id").references(() => user.id, {
    onDelete: "set null",
  }),
  targetUserId: text("target_user_id").references(() => user.id, {
    onDelete: "set null",
  }),
  operation: varchar("operation").notNull(),
  oldRole: varchar("old_role"),
  newRole: varchar("new_role"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

export const platformWorkspaceGrant = pgTable(
  "platform_workspace_grant",
  {
    id: varchar("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    organizationId: varchar("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    role: varchar("role").notNull().default("owner"),
    /** Access dies at this instant even if nobody remembers to revoke it. */
    expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
    revokedAt: timestamp("revoked_at", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("platform_workspace_grant_user_idx").on(table.userId),
    index("platform_workspace_grant_expires_idx").on(table.expiresAt),
  ]
)
