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

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
})

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)]
)

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)]
)

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)]
)

export const organization = pgTable(
  "organization",
  {
    id: varchar("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: varchar("name").notNull(),
    slug: varchar("slug").notNull(),
    baseCurrency: varchar("base_currency").notNull().default("UGX"),
    status: varchar("status").notNull().default("active"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [uniqueIndex("organization_slug_unique").on(table.slug)]
)

export const organizationMember = pgTable(
  "organization_member",
  {
    id: varchar("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    organizationId: varchar("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: varchar("role").notNull(),
    responsibility: text("responsibility"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("organization_member_org_user_unique").on(table.organizationId, table.userId),
  ]
)

export const invitation = pgTable(
  "invitation",
  {
    id: varchar("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    organizationId: varchar("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    invitedBy: text("invited_by")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    email: varchar("email").notNull(),
    role: varchar("role").notNull(),
    responsibility: text("responsibility"),
    tokenHash: varchar("token_hash").notNull().unique(),
    status: varchar("status").notNull().default("pending"),
    expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
    acceptedAt: timestamp("accepted_at", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  }
)

export const memberProject = pgTable(
  "member_project",
  {
    id: varchar("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    memberId: varchar("member_id")
      .notNull()
      .references(() => organizationMember.id, { onDelete: "cascade" }),
    projectId: varchar("project_id").notNull(),
  },
  (table) => [uniqueIndex("member_project_unique").on(table.memberId, table.projectId)]
)

export const platformUser = pgTable("platform_user", {
  id: varchar("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  role: varchar("role").notNull().default("support"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

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
  id: varchar("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
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

export const supplierCategory = pgTable(
  "supplier_category",
  {
    id: varchar("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    organizationId: varchar("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: varchar("slug").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [uniqueIndex("supplier_category_org_slug_unique").on(table.organizationId, table.slug)]
)

export const expense = pgTable("expense", {
  id: varchar("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  organizationId: varchar("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  projectId: varchar("project_id").references(() => project.id, { onDelete: "set null" }),
  supplierId: varchar("supplier_id").references(() => supplier.id, { onDelete: "set null" }),
  paymentStatus: varchar("payment_status").notNull().default("unpaid"),
  receiptFileId: varchar("receipt_file_id"),
  expenseDate: timestamp("expense_date", { mode: "date" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

export const expenseLine = pgTable("expense_line", {
  id: varchar("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  organizationId: varchar("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  expenseId: varchar("expense_id")
    .notNull()
    .references(() => expense.id, { onDelete: "cascade" }),
  allocationId: varchar("budget_item_id")
    .notNull()
    .references(() => budgetItem.id, { onDelete: "cascade" }),
  itemDescription: text("item_description").notNull(),
  quantity: integer("quantity").notNull().default(1),
  unitRateCents: bigint("unit_rate_cents", { mode: "number" }).notNull().default(0),
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
    id: varchar("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    expenseId: varchar("expense_id").references(() => expense.id, { onDelete: "cascade" }),
    payableId: varchar("payable_id"),
    organizationId: varchar("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    supplierId: varchar("supplier_id").references(() => supplier.id, { onDelete: "set null" }),
    amountCents: bigint("amount_cents", { mode: "number" }).notNull().default(0),
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
  (table) => [uniqueIndex("payment_org_idempotency_unique").on(table.organizationId, table.idempotencyKey)]
)

export const paymentReceipt = pgTable("payment_receipt", {
  id: varchar("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
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

export const uploadedFile = pgTable("file", {
  id: varchar("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  organizationId: varchar("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  uploaderId: text("uploader_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  key: varchar("key").notNull().unique(),
  url: varchar("url").notNull(),
  filename: text("filename").notNull(),
  contentType: varchar("content_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  purpose: varchar("purpose").notNull(),
  status: varchar("status").notNull().default("completed"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

export const document = pgTable("document", {
  id: varchar("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  organizationId: varchar("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  fileId: varchar("file_id")
    .notNull()
    .references(() => uploadedFile.id, { onDelete: "cascade" }),
  type: varchar("type").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const documentLink = pgTable("document_link", {
  id: varchar("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  organizationId: varchar("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  documentId: varchar("document_id")
    .notNull()
    .references(() => document.id, { onDelete: "cascade" }),
  entityType: varchar("entity_type").notNull(),
  entityId: varchar("entity_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const projectAttachment = pgTable(
  "project_attachment",
  {
    id: varchar("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    organizationId: varchar("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    projectId: varchar("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    fileId: varchar("file_id")
      .notNull()
      .references(() => uploadedFile.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  }
)

export const auditLog = pgTable("audit_log", {
  id: varchar("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  organizationId: varchar("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  actorId: text("actor_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  action: varchar("action").notNull(),
  entityType: varchar("entity_type").notNull(),
  entityId: varchar("entity_id").notNull(),
  changes: jsonb("changes").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

export const activityEvent = pgTable("activity_event", {
  id: varchar("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  organizationId: varchar("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  actorId: text("actor_id").references(() => user.id, { onDelete: "set null" }),
  action: varchar("action").notNull(),
  entityType: varchar("entity_type").notNull(),
  entityId: varchar("entity_id").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  organizationMemberships: many(organizationMember),
}))

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}))

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}))

export const organizationRelations = relations(organization, ({ many }) => ({
  members: many(organizationMember),
  projects: many(project),
  suppliers: many(supplier),
}))

export const organizationMemberRelations = relations(organizationMember, ({ one }) => ({
  organization: one(organization, {
    fields: [organizationMember.organizationId],
    references: [organization.id],
  }),
  user: one(user, {
    fields: [organizationMember.userId],
    references: [user.id],
  }),
}))

export const projectRelations = relations(project, ({ many, one }) => ({
  organization: one(organization, {
    fields: [project.organizationId],
    references: [organization.id],
  }),
  budgetItems: many(budgetItem),
  expenses: many(expense),
}))

export const expenseRelations = relations(expense, ({ many, one }) => ({
  organization: one(organization, {
    fields: [expense.organizationId],
    references: [organization.id],
  }),
  project: one(project, {
    fields: [expense.projectId],
    references: [project.id],
  }),
  supplier: one(supplier, {
    fields: [expense.supplierId],
    references: [supplier.id],
  }),
  lines: many(expenseLine),
  payments: many(payment),
}))

export const member = organizationMember
export const allocation = budgetItem
export const ledgerPayment = payment
export const auditEvent = auditLog

export const payable = pgTable("payable", {
  id: varchar("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  organizationId: varchar("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  projectId: varchar("project_id")
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),
  supplierId: varchar("supplier_id").references(() => supplier.id, { onDelete: "set null" }),
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
