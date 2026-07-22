import "server-only"
import { db } from "@workspace/db"
import { supplier, organization, expense, project, payment } from "@workspace/db/schema"
import { desc, eq } from "drizzle-orm"

export async function listPlatformSuppliers() {
  const rows = await db
    .select({
      id: supplier.id,
      name: supplier.name,
      phone: supplier.phone,
      email: supplier.email,
      category: supplier.category,
      status: supplier.status,
      createdAt: supplier.createdAt,
      organizationName: organization.name,
    })
    .from(supplier)
    .innerJoin(organization, eq(supplier.organizationId, organization.id))
    .orderBy(desc(supplier.createdAt))

  return rows
}

export async function listPlatformReceipts() {
  const rows = await db
    .select({
      id: expense.id,
      paymentStatus: expense.paymentStatus,
      expenseDate: expense.expenseDate,
      createdAt: expense.createdAt,
      organizationName: organization.name,
      projectName: project.name,
      supplierName: supplier.name,
    })
    .from(expense)
    .innerJoin(organization, eq(expense.organizationId, organization.id))
    .leftJoin(project, eq(expense.projectId, project.id))
    .leftJoin(supplier, eq(expense.supplierId, supplier.id))
    .orderBy(desc(expense.createdAt))

  return rows.map((r) => ({
    ...r,
    projectName: r.projectName ?? "None",
    supplierName: r.supplierName ?? "None",
  }))
}

export async function listPlatformPayments() {
  const rows = await db
    .select({
      id: payment.id,
      amountCents: payment.amountCents,
      currency: payment.currency,
      paymentDate: payment.paymentDate,
      method: payment.method,
      reference: payment.reference,
      createdAt: payment.createdAt,
      organizationName: organization.name,
      supplierName: supplier.name,
    })
    .from(payment)
    .innerJoin(organization, eq(payment.organizationId, organization.id))
    .leftJoin(supplier, eq(payment.supplierId, supplier.id))
    .orderBy(desc(payment.createdAt))

  return rows.map((r) => ({
    ...r,
    supplierName: r.supplierName ?? "None",
  }))
}
