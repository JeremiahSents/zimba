import "server-only"
import { and, asc, desc, eq } from "drizzle-orm"
import { db, schema } from "@workspace/db"
import * as expenseRepo from "../expenses/repository"

export async function listSuppliers(organizationId: string) {
  return await db
    .select()
    .from(schema.supplier)
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
