import "server-only"
import { db } from "@workspace/db"
import { createSupplier as insertSupplier, createSupplierCategory as insertSupplierCategory, findSupplierCategoryBySlug, listSupplierCategories as listSupplierCategoryRows, listSupplierSummaries as listSupplierSummaryRows, listSuppliers as listSupplierRows, updateSupplierForOrganization } from "@workspace/db/repositories"
import type { supplier, supplierCategory } from "@workspace/db/schema"
import * as expenseRepo from "../expenses/repository"

export function listSuppliersForOrganization(organizationId: string) { return listSupplierRows(db, organizationId) }
export function listSuppliers(organizationId: string) { return listSuppliersForOrganization(organizationId) }
export function listSupplierSummaries(organizationId: string) { return listSupplierSummaryRows(db, organizationId) }
export function createSupplier(data: typeof supplier.$inferInsert) { return insertSupplier(db, data) }
export function listSupplierCategoriesForOrganization(organizationId: string) { return listSupplierCategoryRows(db, organizationId) }
export function listSupplierCategories(organizationId: string) { return listSupplierCategoriesForOrganization(organizationId) }
export function getSupplierCategoryBySlug(organizationId: string, slug: string) { return findSupplierCategoryBySlug(db, organizationId, slug).then(([category]) => category ?? null) }
export function createSupplierCategory(data: typeof supplierCategory.$inferInsert) { return insertSupplierCategory(db, data) }
export async function getSupplierFinancials(organizationId: string, supplierId: string) { const rows = (await expenseRepo.listFinancialExpenseRows(organizationId)).filter((expense) => expense.supplierId === supplierId); return { receiptCount: new Set(rows.map((expense) => expense.receiptId)).size, incurredCents: rows.reduce((sum, expense) => sum + expense.amountCents, 0), paidCents: rows.reduce((sum, expense) => sum + expense.paidCents, 0) } }
export function updateSupplier(organizationId: string, supplierId: string, data: Partial<typeof supplier.$inferInsert>) { return updateSupplierForOrganization(db, organizationId, supplierId, data).then((value) => value ?? null) }
