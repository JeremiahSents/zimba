import { and, desc, eq, inArray, or, sql } from "drizzle-orm"
import { file } from "../files/schema"
import { budgetItem, project } from "../projects/schema"
import type { DatabaseExecutor } from "../shared/executor"
import { supplier } from "../suppliers/schema"
import { expense, expenseLine, payable, payment } from "./schema"

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
    .from(payment)
    .where(
      and(
        eq(payment.payableId, payableId),
        eq(payment.organizationId, organizationId)
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
      receiptFile: file,
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
      file,
      and(
        eq(file.id, expense.receiptFileId),
        eq(file.organizationId, expense.organizationId)
      )
    )
    .where(
      and(eq(expense.id, expenseId), eq(expense.organizationId, organizationId))
    )
    .limit(1)
  if (!row) return null
  const lines = await executor
    .select({ line: expenseLine, allocationName: budgetItem.name })
    .from(expenseLine)
    .leftJoin(
      budgetItem,
      and(
        eq(budgetItem.id, expenseLine.budgetItemId),
        eq(budgetItem.organizationId, expenseLine.organizationId)
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
    .from(payment)
    .where(
      and(
        eq(payment.organizationId, organizationId),
        sql`(${payment.expenseId} = ${expenseId} OR ${payment.payableId} = ${expenseId})`
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
    .select({ line: expenseLine, allocationName: budgetItem.name })
    .from(expenseLine)
    .leftJoin(
      budgetItem,
      and(
        eq(budgetItem.id, expenseLine.budgetItemId),
        eq(budgetItem.organizationId, expenseLine.organizationId)
      )
    )
    .where(
      and(
        eq(expenseLine.expenseId, receiptId),
        eq(expenseLine.organizationId, organizationId)
      )
    )
}

export function listReceiptLinesWithAllocationForExpenses(
  executor: DatabaseExecutor,
  organizationId: string,
  expenseIds: string[]
) {
  if (expenseIds.length === 0) return Promise.resolve([])

  return executor
    .select({ line: expenseLine, allocationName: budgetItem.name })
    .from(expenseLine)
    .leftJoin(
      budgetItem,
      and(
        eq(budgetItem.id, expenseLine.budgetItemId),
        eq(budgetItem.organizationId, expenseLine.organizationId)
      )
    )
    .where(
      and(
        eq(expenseLine.organizationId, organizationId),
        inArray(expenseLine.expenseId, expenseIds)
      )
    )
}

export function listReceiptPaymentsForExpenses(
  executor: DatabaseExecutor,
  organizationId: string,
  expenseIds: string[]
) {
  if (expenseIds.length === 0) return Promise.resolve([])

  return executor
    .select()
    .from(payment)
    .where(
      and(
        eq(payment.organizationId, organizationId),
        or(
          inArray(payment.expenseId, expenseIds),
          inArray(payment.payableId, expenseIds)
        )
      )
    )
}

export function listPayablePaymentsForPayables(
  executor: DatabaseExecutor,
  organizationId: string,
  payableIds: string[]
) {
  if (payableIds.length === 0) return Promise.resolve([])

  return executor
    .select()
    .from(payment)
    .where(
      and(
        eq(payment.organizationId, organizationId),
        inArray(payment.payableId, payableIds)
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
    .returning()
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
    .delete(payment)
    .where(
      and(
        eq(payment.organizationId, organizationId),
        eq(payment.payableId, payableId)
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
  data: typeof payment.$inferInsert
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
  const [created] = await executor.insert(payment).values(data).returning()
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
      paid: sql<number>`coalesce((select sum(${payment.amountCents}) from ${payment} where ${payment.expenseId} = ${expenseId} and ${payment.organizationId} = ${organizationId}), 0)`,
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
      status:
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
  budgetItemId: string
) {
  return executor
    .update(expenseLine)
    .set({
      budgetItemId,
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
  data: typeof payment.$inferInsert
) {
  return executor.insert(payment).values(data)
}

export function listReceiptPayments(
  executor: DatabaseExecutor,
  organizationId: string,
  expenseId: string
) {
  return executor
    .select()
    .from(payment)
    .where(
      and(
        eq(payment.expenseId, expenseId),
        eq(payment.organizationId, organizationId)
      )
    )
}

export async function updateReceiptPaymentStatus(
  executor: DatabaseExecutor,
  organizationId: string,
  expenseId: string,
  status: string
) {
  const [updated] = await executor
    .update(expense)
    .set({ status, updatedAt: new Date() })
    .where(
      and(eq(expense.id, expenseId), eq(expense.organizationId, organizationId))
    )
    .returning()
  return updated
}
