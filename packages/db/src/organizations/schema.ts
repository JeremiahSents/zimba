import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core"

import { user } from "../auth/schema"

export const organization = pgTable(
  "organization",
  {
    id: varchar("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: varchar("name").notNull(),
    slug: varchar("slug").notNull(),
    currency: varchar("currency").notNull().default("UGX"),
    status: varchar("status").notNull().default("active"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [uniqueIndex("organization_slug_unique").on(table.slug)]
)

export const member = pgTable(
  "member",
  {
    id: varchar("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    organizationId: varchar("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: varchar("role").notNull(),
    responsibility: text("responsibility"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("member_org_user_unique").on(
      table.organizationId,
      table.userId
    ),
  ]
)

export const invitation = pgTable(
  "invitation",
  {
    id: varchar("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    organizationId: varchar("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    /**
     * Nullable on purpose: a pending invitation is the organization's, not the
     * inviter's. Deleting the inviter's account must not silently retract
     * invitations other people are about to accept.
     */
    invitedBy: text("invited_by").references(() => user.id, {
      onDelete: "set null",
    }),
    name: text("name").notNull(),
    email: varchar("email").notNull(),
    role: varchar("role").notNull(),
    responsibility: text("responsibility"),
    tokenHash: varchar("token_hash").notNull().unique(),
    status: varchar("status").notNull().default("pending"),
    expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
    acceptedAt: timestamp("accepted_at", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("invitation_status_hash_idx").on(table.status, table.tokenHash),
  ]
)
