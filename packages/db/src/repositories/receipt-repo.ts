import { and, desc, eq, sql } from "drizzle-orm"
import {
  expense,
  expenseLine,
  ledgerPayment,
  payable,
} from "../schemas/receipt-schema"
import { allocation, project } from "../schemas/project-schema"
import { supplier } from "../schemas/supplier-schema"
import { uploadedFile } from "../schemas/file-schema"
import type { DatabaseExecutor } from "./types"

export function findReceiptForOrganization(
  executor: DatabaseExecutor,
  organizationId: string,
  receiptId: string
) {
  return executor
    .select()
    .from(expense)
    .where(
      and(eq(expense.id, receiptId), eq(expense.organizationId, organizationId))
    )
    .limit(1)
}

export function listReceiptsForProject(
  executor: DatabaseExecutor,
  organizationId: string,
  projectId: string
) {
  return executor
    .select()
    .from(expense)
    .where(
      and(
        eq(expense.organizationId, organizationId),
        eq(expense.projectId, projectId)
      )
    )
    .orderBy(desc(expense.createdAt))
}

export function listExpensesForOrganization(
  executor: DatabaseExecutor,
  organizationId: string,
  projectId?: string
) {
  return executor
    .select({ expense, projectName: project.name, supplierName: supplier.name })
    .from(expense)
    .leftJoin(
      project,
      and(
        eq(project.id, expense.projectId),
        eq(project.organizationId, expense.organizationId)
      )
    )
    .leftJoin(
      supplier,
      and(
        eq(supplier.id, expense.supplierId),
        eq(supplier.organizationId, expense.organizationId)
      )
    )
    .where(
      projectId
        ? and(
            eq(expense.organizationId, organizationId),
            eq(expense.projectId, projectId)
          )
        : eq(expense.organizationId, organizationId)
    )
    .orderBy(desc(expense.createdAt))
}

export function listPayablesForOrganization(
  executor: DatabaseExecutor,
  organizationId: string
) {
  return executor
    .select({ payable, projectName: project.name, supplierName: supplier.name })
    .from(payable)
    .leftJoin(
      project,
      and(
        eq(project.id, payable.projectId),
        eq(project.organizationId, payable.organizationId)
      )
    )
    .leftJoin(
      supplier,
      and(
        eq(supplier.id, payable.supplierId),
        eq(supplier.organizationId, payable.organizationId)
      )
    )
    .where(eq(payable.organizationId, organizationId))
    .orderBy(desc(payable.createdAt))
}

export async function findPayableForOrganization(
  executor: DatabaseExecutor,
  organizationId: string,
  payableId: string
) {
  const [row] = await executor
    .select({ payable, projectName: project.name, supplierName: supplier.name })
    .from(payable)
    .leftJoin(
      project,
      and(
        eq(project.id, payable.projectId),
        eq(project.organizationId, payable.organizationId)
      )
    )
    .leftJoin(
      supplier,
      and(
        eq(supplier.id, payable.supplierId),
        eq(supplier.organizationId, payable.organizationId)
      )
    )
    .where(
      and(eq(payable.id, payableId), eq(payable.organizationId, organizationId))
    )
    .limit(1)
  if (!row) return null
  const payments = await executor
    .select()
    .from(ledgerPayment)
    .where(
      and(
        eq(ledgerPayment.payableId, payableId),
        eq(ledgerPayment.organizationId, organizationId)
      )
    )
  return { ...row, payments }
}

export async function findExpenseForOrganization(
  executor: DatabaseExecutor,
  organizationId: string,
  expenseId: string
) {
  const [row] = await executor
    .select({
      expense,
      projectName: project.name,
      supplierName: supplier.name,
      receiptFile: uploadedFile,
    })
    .from(expense)
    .leftJoin(
      project,
      and(
        eq(project.id, expense.projectId),
        eq(project.organizationId, expense.organizationId)
      )
    )
    .leftJoin(
      supplier,
      and(
        eq(supplier.id, expense.supplierId),
        eq(supplier.organizationId, expense.organizationId)
      )
    )
    .leftJoin(
      uploadedFile,
      and(
        eq(uploadedFile.id, expense.receiptFileId),
        eq(uploadedFile.organizationId, expense.organizationId)
      )
    )
    .where(
      and(eq(expense.id, expenseId), eq(expense.organizationId, organizationId))
    )
    .limit(1)
  if (!row) return null
  const lines = await executor
    .select({ line: expenseLine, allocationName: allocation.name })
    .from(expenseLine)
    .leftJoin(
      allocation,
      and(
        eq(allocation.id, expenseLine.allocationId),
        eq(allocation.organizationId, expenseLine.organizationId)
      )
    )
    .where(
      and(
        eq(expenseLine.expenseId, expenseId),
        eq(expenseLine.organizationId, organizationId)
      )
    )
  const payments = await executor
    .select()
    .from(ledgerPayment)
    .where(
      and(
        eq(ledgerPayment.organizationId, organizationId),
        sql`(${ledgerPayment.expenseId} = ${expenseId} OR ${ledgerPayment.payableId} = ${expenseId})`
      )
    )
  return { ...row, lines, payments }
}

export function listReceiptLines(
  executor: DatabaseExecutor,
  organizationId: string,
  receiptId: string
) {
  return executor
    .select()
    .from(expenseLine)
    .where(
      and(
        eq(expenseLine.organizationId, organizationId),
        eq(expenseLine.expenseId, receiptId)
      )
    )
    .orderBy(desc(expenseLine.createdAt))
}

export function listReceiptLinesWithAllocation(
  executor: DatabaseExecutor,
  organizationId: string,
  receiptId: string
) {
  return executor
    .select({ line: expenseLine, allocationName: allocation.name })
    .from(expenseLine)
    .leftJoin(
      allocation,
      and(
        eq(allocation.id, expenseLine.allocationId),
        eq(allocation.organizationId, expenseLine.organizationId)
      )
    )
    .where(
      and(
        eq(expenseLine.expenseId, receiptId),
        eq(expenseLine.organizationId, organizationId)
      )
    )
}

export function deleteReceiptForOrganization(
  executor: DatabaseExecutor,
  organizationId: string,
  receiptId: string
) {
  return executor
    .delete(expense)
    .where(
      and(eq(expense.id, receiptId), eq(expense.organizationId, organizationId))
    )
}

export async function createPayable(
  executor: DatabaseExecutor,
  data: typeof payable.$inferInsert
) {
  const [projectRow] = await executor
    .select({ id: project.id })
    .from(project)
    .where(
      and(
        eq(project.id, data.projectId),
        eq(project.organizationId, data.organizationId)
      )
    )
    .limit(1)
  if (!projectRow) return undefined
  const [created] = await executor.insert(payable).values(data).returning()
  return created
}

export function listPayablesForProject(
  executor: DatabaseExecutor,
  organizationId: string,
  projectId: string
) {
  return executor
    .select()
    .from(payable)
    .where(
      and(
        eq(payable.organizationId, organizationId),
        eq(payable.projectId, projectId)
      )
    )
    .orderBy(desc(payable.dueDate))
}

export async function updatePayableForOrganization(
  executor: DatabaseExecutor,
  organizationId: string,
  payableId: string,
  data: Partial<typeof payable.$inferInsert>
) {
  const [updated] = await executor
    .update(payable)
    .set(data)
    .where(
      and(eq(payable.id, payableId), eq(payable.organizationId, organizationId))
    )
    .returning()
  return updated
}

export async function deletePayableForOrganization(
  executor: DatabaseExecutor,
  organizationId: string,
  payableId: string
) {
  await executor
    .delete(ledgerPayment)
    .where(
      and(
        eq(ledgerPayment.organizationId, organizationId),
        eq(ledgerPayment.payableId, payableId)
      )
    )
  const [deleted] = await executor
    .delete(payable)
    .where(
      and(eq(payable.id, payableId), eq(payable.organizationId, organizationId))
    )
    .returning()
  return deleted
}

export async function createLedgerPayment(
  executor: DatabaseExecutor,
  data: typeof ledgerPayment.$inferInsert
) {
  if (data.supplierId) {
    const [supplierRow] = await executor
      .select({ id: supplier.id })
      .from(supplier)
      .where(
        and(
          eq(supplier.id, data.supplierId),
          eq(supplier.organizationId, data.organizationId)
        )
      )
      .limit(1)
    if (!supplierRow) return undefined
  }
  const [created] = await executor
    .insert(ledgerPayment)
    .values(data)
    .returning()
  return created
}

export async function syncExpensePaymentStatus(
  executor: DatabaseExecutor,
  organizationId: string,
  expenseId: string
) {
  const [totals] = await executor
    .select({
      total: sql<number>`coalesce((select sum(${expenseLine.amountCents}) from ${expenseLine} where ${expenseLine.expenseId} = ${expenseId} and ${expenseLine.organizationId} = ${organizationId}), 0)`,
      paid: sql<number>`coalesce((select sum(${ledgerPayment.amountCents}) from ${ledgerPayment} where ${ledgerPayment.expenseId} = ${expenseId} and ${ledgerPayment.organizationId} = ${organizationId}), 0)`,
    })
    .from(expense)
    .where(
      and(eq(expense.id, expenseId), eq(expense.organizationId, organizationId))
    )
    .limit(1)
  if (!totals) return
  const total = Number(totals.total)
  const paid = Number(totals.paid)
  await executor
    .update(expense)
    .set({
      paymentStatus:
        paid >= total && total > 0 ? "paid" : paid > 0 ? "partial" : "unpaid",
    })
    .where(
      and(eq(expense.id, expenseId), eq(expense.organizationId, organizationId))
    )
}

export async function updateReceiptLinesAllocation(
  executor: DatabaseExecutor,
  organizationId: string,
  expenseId: string,
  allocationId: string
) {
  return executor
    .update(expenseLine)
    .set({
      allocationId,
      legacyAllocationId: allocationId,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(expenseLine.organizationId, organizationId),
        eq(expenseLine.expenseId, expenseId)
      )
    )
}

export async function updateReceiptForOrganization(
  executor: DatabaseExecutor,
  organizationId: string,
  expenseId: string,
  data: Partial<typeof expense.$inferInsert>
) {
  const [updated] = await executor
    .update(expense)
    .set({ ...data, updatedAt: new Date() })
    .where(
      and(eq(expense.id, expenseId), eq(expense.organizationId, organizationId))
    )
    .returning()
  return updated
}

export async function insertReceipt(
  executor: DatabaseExecutor,
  data: typeof expense.$inferInsert
) {
  const [created] = await executor.insert(expense).values(data).returning()
  return created
}

export function insertReceiptLine(
  executor: DatabaseExecutor,
  data: typeof expenseLine.$inferInsert
) {
  return executor.insert(expenseLine).values(data)
}

export function insertReceiptPayment(
  executor: DatabaseExecutor,
  data: typeof ledgerPayment.$inferInsert
) {
  return executor.insert(ledgerPayment).values(data)
}

export function listReceiptPayments(
  executor: DatabaseExecutor,
  organizationId: string,
  expenseId: string
) {
  return executor
    .select()
    .from(ledgerPayment)
    .where(
      and(
        eq(ledgerPayment.expenseId, expenseId),
        eq(ledgerPayment.organizationId, organizationId)
      )
    )
}

export async function updateReceiptPaymentStatus(
  executor: DatabaseExecutor,
  organizationId: string,
  expenseId: string,
  paymentStatus: string
) {
  const [updated] = await executor
    .update(expense)
    .set({ paymentStatus, updatedAt: new Date() })
    .where(
      and(eq(expense.id, expenseId), eq(expense.organizationId, organizationId))
    )
    .returning()
  return updated
}
