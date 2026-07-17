import { integer, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core"
import { organization } from "../organizations/schema"
import { project } from "../projects/schema"
import { supplier } from "../suppliers/schema"

export const payable = pgTable("payable", {
  id: varchar("id").primaryKey(),
  organizationId: varchar("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  projectId: varchar("project_id")
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),
  supplierId: varchar("supplier_id")
    .references(() => supplier.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  description: text("description"),
  amountCents: integer("amount_cents").notNull().default(0),
  currency: varchar("currency").notNull().default("UGX"),
  dueDate: timestamp("due_date", { mode: "date" }),
  status: varchar("status").notNull().default("pending"), // pending, paid
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

export const ledgerPayment = pgTable("ledger_payment", {
  id: varchar("id").primaryKey(),
  organizationId: varchar("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  payableId: varchar("payable_id")
    .references(() => payable.id, { onDelete: "set null" }),
  supplierId: varchar("supplier_id")
    .references(() => supplier.id, { onDelete: "set null" }),
  amountCents: integer("amount_cents").notNull().default(0),
  currency: varchar("currency").notNull().default("UGX"),
  paymentDate: timestamp("payment_date", { mode: "date" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})
