import "server-only"
import { and, asc, desc, eq } from "drizzle-orm"
import { db, schema } from "../shared/db"
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
  const rows = (await expenseRepo.listExpenses(organizationId)).filter(({ expense }) => expense.supplierId === supplierId)
  let incurredCents = 0
  let paidCents = 0
  for (const { expense } of rows) {
    const detail = await expenseRepo.getExpense(organizationId, expense.id)
    incurredCents += (detail?.lines ?? []).reduce((sum, { line }) => sum + line.amountCents, 0)
    paidCents += (detail?.payments ?? []).reduce((sum, payment) => sum + payment.amountCents, 0)
  }
  return { receiptCount: rows.length, incurredCents, paidCents }
}
