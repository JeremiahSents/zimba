import "server-only"
import { db } from "@workspace/db"
import { createLedgerPayment as insertLedgerPayment, createPayable as insertPayable, deletePayableForOrganization, listPayablesForProject, syncExpensePaymentStatus as syncStatus, updatePayableForOrganization } from "@workspace/db/repositories"
import type { ledgerPayment, payable } from "@workspace/db/schema"

export function createPayable(data: typeof payable.$inferInsert) { return insertPayable(db, data) }
export function listProjectPayables(organizationId: string, projectId: string) { return listPayablesForProject(db, organizationId, projectId) }
export function updatePayable(organizationId: string, id: string, data: Partial<typeof payable.$inferInsert>) { return updatePayableForOrganization(db, organizationId, id, data) }
export function deletePayable(organizationId: string, id: string) { return deletePayableForOrganization(db, organizationId, id) }
export function createLedgerPayment(data: typeof ledgerPayment.$inferInsert) { return insertLedgerPayment(db, data) }
export function syncExpensePaymentStatus(organizationId: string, expenseId: string) { return syncStatus(db, organizationId, expenseId) }
