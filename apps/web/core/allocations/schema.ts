import { integer, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core"
import { organization } from "../organizations/schema"
import { project } from "../projects/schema"

export const allocation = pgTable("allocation", {
  id: varchar("id").primaryKey(),
  organizationId: varchar("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  projectId: varchar("project_id")
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  budgetCents: integer("budget_cents").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})
