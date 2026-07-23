import { relations } from "drizzle-orm"
import { account, session, user } from "./auth-schema"
import { organization, organizationMember } from "./organization-schema"
import { budgetItem, project } from "./project-schema"
import { expense, expenseLine, payment } from "./receipt-schema"
import { supplier } from "./supplier-schema"

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
