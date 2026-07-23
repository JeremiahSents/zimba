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

import { user, session, account, verification } from "./auth-schema"
import {
  organization,
  organizationMember,
  invitation,
  memberProject,
} from "./organization-schema"
import { project, budgetItem } from "./project-schema"
import {
  expense,
  expenseLine,
  payment,
  paymentReceipt,
  payable,
} from "./receipt-schema"
import { supplier, supplierCategory } from "./supplier-schema"
import {
  uploadedFile,
  document,
  documentLink,
  projectAttachment,
} from "./file-schema"
import { auditLog, activityEvent } from "./audit-schema"
import { platformUser, platformAuditLog } from "./platform-schema"

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

export const organizationMemberRelations = relations(
  organizationMember,
  ({ one }) => ({
    organization: one(organization, {
      fields: [organizationMember.organizationId],
      references: [organization.id],
    }),
    user: one(user, {
      fields: [organizationMember.userId],
      references: [user.id],
    }),
  })
)

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
