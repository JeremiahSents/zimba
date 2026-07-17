import { pgTable, uniqueIndex, varchar } from "drizzle-orm/pg-core"
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
  },
  (table) => [
    uniqueIndex("member_organization_user_unique").on(
      table.organizationId,
      table.userId
    ),
  ]
)
