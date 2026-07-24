import { relations } from "drizzle-orm"
import { account, session, user } from "./auth-schema"
import { onboardingApplication } from "./onboarding-schema"
import { organization, organizationMember } from "./organization-schema"
import { ownershipTransferRequest } from "./ownership-transfer-schema"
import { budgetItem, project } from "./project-schema"
import {
  expense,
  expenseLine,
  payable,
  payment,
  paymentReceipt,
} from "./receipt-schema"
import { supplier, supplierCategory } from "./supplier-schema"

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
  supplierCategories: many(supplierCategory),
  expenses: many(expense),
  payments: many(payment),
  payables: many(payable),
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
  payables: many(payable),
}))

export const budgetItemRelations = relations(budgetItem, ({ many, one }) => ({
  organization: one(organization, {
    fields: [budgetItem.organizationId],
    references: [organization.id],
  }),
  project: one(project, {
    fields: [budgetItem.projectId],
    references: [project.id],
  }),
  expenseLines: many(expenseLine),
}))

export const supplierRelations = relations(supplier, ({ many, one }) => ({
  organization: one(organization, {
    fields: [supplier.organizationId],
    references: [organization.id],
  }),
  expenses: many(expense),
  payments: many(payment),
  payables: many(payable),
}))

export const supplierCategoryRelations = relations(
  supplierCategory,
  ({ one }) => ({
    organization: one(organization, {
      fields: [supplierCategory.organizationId],
      references: [organization.id],
    }),
  })
)

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

export const expenseLineRelations = relations(expenseLine, ({ one }) => ({
  organization: one(organization, {
    fields: [expenseLine.organizationId],
    references: [organization.id],
  }),
  expense: one(expense, {
    fields: [expenseLine.expenseId],
    references: [expense.id],
  }),
  budgetItem: one(budgetItem, {
    fields: [expenseLine.allocationId],
    references: [budgetItem.id],
  }),
}))

export const paymentRelations = relations(payment, ({ one }) => ({
  organization: one(organization, {
    fields: [payment.organizationId],
    references: [organization.id],
  }),
  expense: one(expense, {
    fields: [payment.expenseId],
    references: [expense.id],
  }),
  supplier: one(supplier, {
    fields: [payment.supplierId],
    references: [supplier.id],
  }),
}))

export const paymentReceiptRelations = relations(paymentReceipt, ({ one }) => ({
  organization: one(organization, {
    fields: [paymentReceipt.organizationId],
    references: [organization.id],
  }),
  payment: one(payment, {
    fields: [paymentReceipt.paymentId],
    references: [payment.id],
  }),
}))

export const payableRelations = relations(payable, ({ one }) => ({
  organization: one(organization, {
    fields: [payable.organizationId],
    references: [organization.id],
  }),
  project: one(project, {
    fields: [payable.projectId],
    references: [project.id],
  }),
  supplier: one(supplier, {
    fields: [payable.supplierId],
    references: [supplier.id],
  }),
}))

export const onboardingApplicationRelations = relations(
  onboardingApplication,
  ({ one }) => ({
    user: one(user, {
      fields: [onboardingApplication.userId],
      references: [user.id],
    }),
    organization: one(organization, {
      fields: [onboardingApplication.organizationId],
      references: [organization.id],
    }),
    reviewer: one(user, {
      fields: [onboardingApplication.reviewedBy],
      references: [user.id],
      relationName: "reviewer",
    }),
  })
)

export const ownershipTransferRequestRelations = relations(
  ownershipTransferRequest,
  ({ one }) => ({
    organization: one(organization, {
      fields: [ownershipTransferRequest.organizationId],
      references: [organization.id],
    }),
    fromUser: one(user, {
      fields: [ownershipTransferRequest.fromUserId],
      references: [user.id],
      relationName: "transferFrom",
    }),
    toUser: one(user, {
      fields: [ownershipTransferRequest.toUserId],
      references: [user.id],
      relationName: "transferTo",
    }),
    reviewer: one(user, {
      fields: [ownershipTransferRequest.reviewedBy],
      references: [user.id],
      relationName: "transferReviewer",
    }),
  })
)
