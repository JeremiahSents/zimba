import { sql } from "drizzle-orm"
import {
  bigint,
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core"

import { file } from "../files/schema"
import { organization } from "../organizations/schema"
import { budgetItem, project } from "../projects/schema"
import { supplier } from "../suppliers/schema"

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
    status: varchar("status").notNull().default("unpaid"),
    receiptFileId: varchar("receipt_file_id").references(() => file.id, {
      onDelete: "set null",
    }),
    /**
     * The PDF Zimba generates for this receipt — not to be confused with
     * `receiptFileId` above, which is the photo of the supplier's paper receipt
     * that someone uploaded. The line is uploaded evidence vs. generated
     * document; "document" is the word the UI uses for the latter.
     */
    documentFileId: varchar("document_file_id").references(() => file.id, {
      onDelete: "set null",
    }),
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
  budgetItemId: varchar("budget_item_id")
    .notNull()
    .references(() => budgetItem.id, { onDelete: "cascade" }),
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

export const payment = pgTable(
  "payment",
  {
    id: varchar("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    expenseId: varchar("expense_id").references(() => expense.id, {
      onDelete: "cascade",
    }),
    payableId: varchar("payable_id").references(() => payable.id, {
      onDelete: "cascade",
    }),
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
    /** The payment voucher Zimba generates for this payment row. */
    documentFileId: varchar("document_file_id").references(() => file.id, {
      onDelete: "set null",
    }),
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
    // A payment settles an expense or a payable, never both. Older rows predate
    // both links and are left alone, so "neither" stays allowed.
    check(
      "payment_single_target",
      sql`not (${table.expenseId} is not null and ${table.payableId} is not null)`
    ),
  ]
)
