import { and, asc, desc, eq, sql } from "drizzle-orm"
import { expense, expenseLine, ledgerPayment } from "../schemas/receipt-schema"
import { supplier, supplierCategory } from "../schemas/supplier-schema"
import type { DatabaseExecutor } from "./types"

export function listSuppliersForOrganization(executor: DatabaseExecutor, organizationId: string) {
  return executor.select().from(supplier).where(eq(supplier.organizationId, organizationId))
}

export function findSupplierForOrganization(executor: DatabaseExecutor, organizationId: string, supplierId: string) {
  return executor.select().from(supplier).where(and(eq(supplier.organizationId, organizationId), eq(supplier.id, supplierId))).limit(1)
}

export function findSupplierByNameForOrganization(executor: DatabaseExecutor, organizationId: string, name: string) {
  return executor.select().from(supplier).where(and(eq(supplier.organizationId, organizationId), eq(supplier.name, name))).limit(1)
}

export function listSuppliers(executor: DatabaseExecutor, organizationId: string) {
  return executor.select().from(supplier).where(eq(supplier.organizationId, organizationId)).orderBy(desc(supplier.createdAt))
}

export function listSupplierSummaries(executor: DatabaseExecutor, organizationId: string) {
  return executor.select({ id: supplier.id, name: supplier.name, category: supplier.category, phone: supplier.phone, email: supplier.email, notes: supplier.notes, companyContact: supplier.companyContact, contactName: supplier.contactName, status: supplier.status, receiptCount: sql<number>`coalesce((select count(distinct ${expense.id}) from ${expense} where ${expense.organizationId} = ${organizationId} and ${expense.supplierId} = ${supplier.id}), 0)`, incurredCents: sql<number>`coalesce((select sum(${expenseLine.amountCents}) from ${expenseLine} inner join ${expense} on ${expense.id} = ${expenseLine.expenseId} where ${expenseLine.organizationId} = ${organizationId} and ${expense.supplierId} = ${supplier.id}), 0)`, paidCents: sql<number>`coalesce((select sum(${ledgerPayment.amountCents}) from ${ledgerPayment} where ${ledgerPayment.organizationId} = ${organizationId} and ${ledgerPayment.supplierId} = ${supplier.id}), 0)` }).from(supplier).where(eq(supplier.organizationId, organizationId)).orderBy(desc(supplier.createdAt))
}

export async function createSupplier(executor: DatabaseExecutor, data: typeof supplier.$inferInsert) {
  const [created] = await executor.insert(supplier).values(data).returning()
  return created
}

export function listSupplierCategories(executor: DatabaseExecutor, organizationId: string) {
  return executor.select().from(supplierCategory).where(eq(supplierCategory.organizationId, organizationId)).orderBy(asc(supplierCategory.name))
}

export function findSupplierCategoryBySlug(executor: DatabaseExecutor, organizationId: string, slug: string) {
  return executor.select().from(supplierCategory).where(and(eq(supplierCategory.organizationId, organizationId), eq(supplierCategory.slug, slug))).limit(1)
}

export async function createSupplierCategory(executor: DatabaseExecutor, data: typeof supplierCategory.$inferInsert) {
  const [created] = await executor.insert(supplierCategory).values(data).returning()
  return created
}

export async function updateSupplierForOrganization(executor: DatabaseExecutor, organizationId: string, supplierId: string, data: Partial<typeof supplier.$inferInsert>) {
  const [updated] = await executor.update(supplier).set({ ...data, updatedAt: new Date() }).where(and(eq(supplier.organizationId, organizationId), eq(supplier.id, supplierId))).returning()
  return updated
}
