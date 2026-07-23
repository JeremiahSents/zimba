import {
  bigint,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core"

import { organization } from "./organization-schema"
import { budgetItem, project } from "./project-schema"
import { supplier } from "./supplier-schema"

export const expense = pgTable(
  "expense",
  {
    id: varchar("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    organizationId: varchar("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    projectId: varchar("project_id").references(() => project.id, {
      onDelete: "set null",
    }),
    supplierId: varchar("supplier_id").references(() => supplier.id, {
      onDelete: "set null",
    }),
    paymentStatus: varchar("payment_status").notNull().default("unpaid"),
    receiptFileId: varchar("receipt_file_id"),
    expenseDate: timestamp("expense_date", { mode: "date" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("expense_org_project_idx").on(table.organizationId, table.projectId),
  ]
)

export const expenseLine = pgTable("expense_line", {
  id: varchar("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organizationId: varchar("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  expenseId: varchar("expense_id")
    .notNull()
    .references(() => expense.id, { onDelete: "cascade" }),
  allocationId: varchar("budget_item_id")
    .notNull()
    .references(() => budgetItem.id, { onDelete: "cascade" }),
  // Kept during the staged migration so old production databases with the
  // legacy foreign key can accept new receipt lines as well.
  legacyAllocationId: varchar("allocation_id"),
  itemDescription: text("item_description").notNull(),
  quantity: integer("quantity").notNull().default(1),
  unitRateCents: bigint("unit_rate_cents", { mode: "number" })
    .notNull()
    .default(0),
  amountCents: bigint("amount_cents", { mode: "number" }).notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

export const payment = pgTable(
  "payment",
  {
    id: varchar("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    expenseId: varchar("expense_id").references(() => expense.id, {
      onDelete: "cascade",
    }),
    payableId: varchar("payable_id"),
    organizationId: varchar("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    supplierId: varchar("supplier_id").references(() => supplier.id, {
      onDelete: "set null",
    }),
    amountCents: bigint("amount_cents", { mode: "number" })
      .notNull()
      .default(0),
    currency: varchar("currency").notNull().default("UGX"),
    paymentDate: timestamp("payment_date", { mode: "date" }),
    method: varchar("method"),
    reference: text("reference"),
    idempotencyKey: varchar("idempotency_key"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("payment_org_idempotency_unique").on(
      table.organizationId,
      table.idempotencyKey
    ),
  ]
)

export const paymentReceipt = pgTable("payment_receipt", {
  id: varchar("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organizationId: varchar("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  paymentId: varchar("payment_id")
    .notNull()
    .references(() => payment.id, { onDelete: "cascade" }),
  receiptNumber: varchar("receipt_number").notNull(),
  fileId: varchar("file_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const payable = pgTable("payable", {
  id: varchar("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  organizationId: varchar("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  projectId: varchar("project_id")
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),
  supplierId: varchar("supplier_id").references(() => supplier.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  description: text("description"),
  amountCents: bigint("amount_cents", { mode: "number" }).notNull().default(0),
  currency: varchar("currency").notNull().default("UGX"),
  dueDate: timestamp("due_date", { mode: "date" }),
  status: varchar("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

export const ledgerPayment = payment
