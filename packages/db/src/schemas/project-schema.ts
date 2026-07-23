import { relations } from "drizzle-orm"
import {
  bigint,
  boolean,
  integer,
  jsonb,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core"

import { organization } from "./organization-schema"

export const project = pgTable("project", {
  id: varchar("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organizationId: varchar("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  location: text("location").notNull(),
  plotSize: text("plot_size"),
  landSize: text("land_size"),
  buildingType: text("building_type"),
  clientName: text("client_name"),
  status: varchar("status").notNull().default("active"),
  currency: varchar("currency").notNull().default("UGX"),
  startDate: timestamp("start_date", { mode: "date" }),
  targetEndDate: timestamp("target_end_date", { mode: "date" }),
  archivedAt: timestamp("archived_at", { mode: "date" }),
  archivedBy: varchar("archived_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

export const budgetItem = pgTable("budget_item", {
  id: varchar("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organizationId: varchar("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  projectId: varchar("project_id")
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  budgetCents: bigint("budget_cents", { mode: "number" }).notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

export const allocation = budgetItem
