import "server-only"
import { and, asc, desc, eq, sql } from "drizzle-orm"
import { db, schema } from "@workspace/db"
import * as expenseRepo from "../expenses/repository"

export async function listSuppliers(organizationId: string) {
  return await db
    .select()
    .from(schema.supplier)
    .where(eq(schema.supplier.organizationId, organizationId))
    .orderBy(desc(schema.supplier.createdAt))
}

export async function listSupplierSummaries(organizationId: string) {
  return db.select({
    id: schema.supplier.id,
    name: schema.supplier.name,
    category: schema.supplier.category,
    phone: schema.supplier.phone,
    email: schema.supplier.email,
    notes: schema.supplier.notes,
    companyContact: schema.supplier.companyContact,
    contactName: schema.supplier.contactName,
    status: schema.supplier.status,
    receiptCount: sql<number>`coalesce((select count(distinct ${schema.expense.id}) from ${schema.expense} where ${schema.expense.organizationId} = ${organizationId} and ${schema.expense.supplierId} = ${schema.supplier.id}), 0)`,
    incurredCents: sql<number>`coalesce((select sum(${schema.expenseLine.amountCents}) from ${schema.expenseLine} inner join ${schema.expense} on ${schema.expense.id} = ${schema.expenseLine.expenseId} where ${schema.expenseLine.organizationId} = ${organizationId} and ${schema.expense.supplierId} = ${schema.supplier.id}), 0)`,
    paidCents: sql<number>`coalesce((select sum(${schema.ledgerPayment.amountCents}) from ${schema.ledgerPayment} where ${schema.ledgerPayment.organizationId} = ${organizationId} and ${schema.ledgerPayment.supplierId} = ${schema.supplier.id}), 0)`,
  }).from(schema.supplier)
    .where(eq(schema.supplier.organizationId, organizationId))
    .orderBy(desc(schema.supplier.createdAt))
}

export async function createSupplier(data: typeof schema.supplier.$inferInsert) {
  const [supplier] = await db.insert(schema.supplier).values(data).returning()
  return supplier
}

export async function listSupplierCategories(organizationId: string) {
  return db.select().from(schema.supplierCategory).where(eq(schema.supplierCategory.organizationId, organizationId)).orderBy(asc(schema.supplierCategory.name))
}

export async function getSupplierCategoryBySlug(organizationId: string, slug: string) {
  const [category] = await db.select().from(schema.supplierCategory).where(and(eq(schema.supplierCategory.organizationId, organizationId), eq(schema.supplierCategory.slug, slug))).limit(1)
  return category ?? null
}

export async function createSupplierCategory(data: typeof schema.supplierCategory.$inferInsert) {
  const [category] = await db.insert(schema.supplierCategory).values(data).returning()
  return category
}

export async function getSupplierFinancials(organizationId: string, supplierId: string) {
  const rows = (await expenseRepo.listFinancialExpenseRows(organizationId)).filter((expense) => expense.supplierId === supplierId)
  const incurredCents = rows.reduce((sum, expense) => sum + expense.amountCents, 0)
  const paidCents = rows.reduce((sum, expense) => sum + expense.paidCents, 0)
  return {
    receiptCount: new Set(rows.map((expense) => expense.receiptId)).size,
    incurredCents,
    paidCents,
  }
}

export async function updateSupplier(
  organizationId: string,
  supplierId: string,
  data: Partial<typeof schema.supplier.$inferInsert>
) {
  const [supplier] = await db.update(schema.supplier).set({ ...data, updatedAt: new Date() }).where(and(eq(schema.supplier.organizationId, organizationId), eq(schema.supplier.id, supplierId))).returning()
  return supplier ?? null
}
