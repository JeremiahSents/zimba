import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core"

import { user } from "./auth-schema"

export const organization = pgTable(
  "organization",
  {
    id: varchar("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: varchar("name").notNull(),
    slug: varchar("slug").notNull(),
    baseCurrency: varchar("base_currency").notNull().default("UGX"),
    status: varchar("status").notNull().default("active"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [uniqueIndex("organization_slug_unique").on(table.slug)]
)

export const organizationMember = pgTable(
  "organization_member",
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
    uniqueIndex("organization_member_org_user_unique").on(
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
    invitedBy: text("invited_by")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    email: varchar("email").notNull(),
    role: varchar("role").notNull(),
    responsibility: text("responsibility"),
    tokenHash: varchar("token_hash").notNull().unique(),
    status: varchar("status").notNull().default("pending"),
    expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
    acceptedBy: text("accepted_by").references(() => user.id, {
      onDelete: "set null",
    }),
    acceptedAt: timestamp("accepted_at", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("invitation_status_hash_idx").on(table.status, table.tokenHash),
  ]
)

export const memberProject = pgTable(
  "member_project",
  {
    id: varchar("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    memberId: varchar("member_id")
      .notNull()
      .references(() => organizationMember.id, { onDelete: "cascade" }),
    projectId: varchar("project_id").notNull(),
  },
  (table) => [
    uniqueIndex("member_project_unique").on(table.memberId, table.projectId),
  ]
)

export const member = organizationMember
