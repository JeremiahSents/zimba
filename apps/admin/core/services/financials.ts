import "server-only"
import { db } from "@workspace/db"
import { supplier, expense, payment } from "@workspace/db/schema"
import { desc } from "drizzle-orm"

export async function listPlatformSuppliers() {
  const suppliers = await db.query.supplier.findMany({
    orderBy: [desc(supplier.createdAt)],
  })

  return suppliers.map(s => ({
    ...s,
    organizationName: "Unknown"
  }))
}

export async function listPlatformReceipts() {
  const receipts = await db.query.expense.findMany({
    orderBy: [desc(expense.createdAt)],
  })

  return receipts.map(r => ({
    ...r,
    organizationName: "Unknown",
    projectName: "None",
    supplierName: "None"
  }))
}

export async function listPlatformPayments() {
  const payments = await db.query.payment.findMany({
    orderBy: [desc(payment.createdAt)],
  })

  return payments.map(p => ({
    ...p,
    organizationName: "Unknown",
    supplierName: "None"
  }))
}
