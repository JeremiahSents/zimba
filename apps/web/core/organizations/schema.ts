import { pgTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core"
import { user } from "../auth/schema"

export const organization = pgTable(
  "organization",
  {
    id: varchar("id").primaryKey(),
    name: varchar("name").notNull(),
    slug: varchar("slug").notNull(),
  },
  (table) => [uniqueIndex("organization_slug_unique").on(table.slug)]
)

export const member = pgTable(
  "member",
  {
    id: varchar("id").primaryKey(),
    organizationId: varchar("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    userId: varchar("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: varchar("role").notNull(),
    responsibility: text("responsibility"),
  },
  (table) => [
    uniqueIndex("member_organization_user_unique").on(
      table.organizationId,
      table.userId
    ),
  ]
)

export const invitation = pgTable("invitation", {
  id: varchar("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  organizationId: varchar("organization_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  invitedBy: varchar("invited_by").notNull().references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: varchar("email").notNull(),
  role: varchar("role").notNull(),
  responsibility: text("responsibility"),
  tokenHash: varchar("token_hash").notNull().unique(),
  status: varchar("status").notNull().default("pending"),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  acceptedAt: timestamp("accepted_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

export const memberProject = pgTable("member_project", {
  id: varchar("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  memberId: varchar("member_id").notNull().references(() => member.id, { onDelete: "cascade" }),
  projectId: varchar("project_id").notNull(),
}, (table) => [uniqueIndex("member_project_unique").on(table.memberId, table.projectId)])
