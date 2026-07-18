import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core"
import { organization } from "../organizations/schema"

export const project = pgTable("project", {
  id: varchar("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  organizationId: varchar("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  location: text("location").notNull(),
  plotSize: text("plot_size"),
  landSize: text("land_size"),
  buildingType: text("building_type"),
  clientName: text("client_name"),
  status: varchar("status").notNull().default("active"), // active, completed, on_hold
  currency: varchar("currency").notNull().default("UGX"),
  startDate: timestamp("start_date", { mode: "date" }),
  targetEndDate: timestamp("target_end_date", { mode: "date" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})
