import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core"
import { organization } from "../organizations/schema"

export const supplier = pgTable("supplier", {
  id: varchar("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  organizationId: varchar("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  phone: varchar("phone"),
  email: varchar("email"),
  notes: text("notes"),
  companyContact: text("company_contact"),
  contactName: text("contact_name"),
  category: varchar("category").default("other"),
  status: varchar("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})
