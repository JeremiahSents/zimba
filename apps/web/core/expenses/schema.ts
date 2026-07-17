import { integer, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core"
import { organization } from "../organizations/schema"
import { project } from "../projects/schema"
import { allocation } from "../allocations/schema"
import { supplier } from "../suppliers/schema"

export const expense = pgTable("expense", {
  id: varchar("id").primaryKey(),
  organizationId: varchar("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  projectId: varchar("project_id")
    .references(() => project.id, { onDelete: "set null" }),
  supplierId: varchar("supplier_id")
    .references(() => supplier.id, { onDelete: "set null" }),
  paymentStatus: varchar("payment_status").notNull().default("unpaid"), // unpaid, partial, paid
  receiptFileId: varchar("receipt_file_id"), // Will add foreign key later or resolve at app level
  expenseDate: timestamp("expense_date", { mode: "date" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

export const expenseLine = pgTable("expense_line", {
  id: varchar("id").primaryKey(),
  organizationId: varchar("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  expenseId: varchar("expense_id")
    .notNull()
    .references(() => expense.id, { onDelete: "cascade" }),
  allocationId: varchar("allocation_id")
    .notNull()
    .references(() => allocation.id, { onDelete: "cascade" }),
  itemDescription: text("item_description").notNull(),
  quantity: integer("quantity").notNull().default(1),
  unitRateCents: integer("unit_rate_cents").notNull().default(0),
  amountCents: integer("amount_cents").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})
