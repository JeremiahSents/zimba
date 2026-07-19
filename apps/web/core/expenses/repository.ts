import "server-only"

import { and, desc, eq } from "drizzle-orm"
import { db, schema } from "@workspace/db"

export type FinancialExpenseRow = {
  id: string
  receiptId: string
  source: "expense" | "payable"
  organizationId: string
  projectId?: string
  supplierId?: string
  allocationId?: string
  date: Date
  createdAt: Date
  taskName: string
  projectName?: string | null
  supplierName?: string | null
  itemDescription: string
  amountCents: number
  paidCents: number
}

export async function listExpenses(organizationId: string) {
  return db
    .select({
      expense: schema.expense,
      projectName: schema.project.name,
      supplierName: schema.supplier.name,
    })
    .from(schema.expense)
    .leftJoin(schema.project, eq(schema.project.id, schema.expense.projectId))
    .leftJoin(schema.supplier, eq(schema.supplier.id, schema.expense.supplierId))
    .where(eq(schema.expense.organizationId, organizationId))
    .orderBy(desc(schema.expense.createdAt))
}

export async function listFinancialExpenseRows(organizationId: string): Promise<FinancialExpenseRow[]> {
  const rows = await listExpenses(organizationId)
  const payables = await listPayables(organizationId)
  const currentExpenseIds = new Set(rows.map(({ expense }) => expense.id))

  const expenseRows = await Promise.all(
    rows.map(async ({ expense, projectName, supplierName }) => {
      const detail = await getExpense(organizationId, expense.id)
      const lines = detail?.lines ?? []
      const payments = detail?.payments ?? []
      const receiptTotalCents = lines.reduce(
        (sum, { line }) => sum + line.amountCents,
        0
      )
      const receiptPaidCents = payments.reduce(
        (sum, payment) => sum + payment.amountCents,
        0
      )

      // Each line owns its proportional share of payments. This preserves the
      // receipt total while making project/task cash spend add up exactly.
      let distributedPaidCents = 0
      return lines.map(({ line, allocationName }, index) => {
        const isLastLine = index === lines.length - 1
        const paidCents = isLastLine
          ? receiptPaidCents - distributedPaidCents
          : receiptTotalCents > 0
            ? Math.round((receiptPaidCents * line.amountCents) / receiptTotalCents)
            : 0
        distributedPaidCents += paidCents
        return {
          id: line.id,
          receiptId: expense.id,
          source: "expense" as const,
          organizationId: expense.organizationId,
          projectId: expense.projectId ?? undefined,
          supplierId: expense.supplierId ?? undefined,
          allocationId: line.allocationId,
          date: expense.expenseDate ?? expense.createdAt,
          createdAt: expense.createdAt,
          taskName: allocationName ?? "General",
          projectName,
          supplierName,
          itemDescription: line.itemDescription,
          amountCents: line.amountCents,
          paidCents,
        }
      })
    })
  )

  const payableRows = await Promise.all(
    payables
      .filter(({ payable }) => !currentExpenseIds.has(payable.id))
      .map(async ({ payable, projectName, supplierName }) => {
        const detail = await getPayable(organizationId, payable.id)
        const paidCents = (detail?.payments ?? []).reduce(
          (sum, payment) => sum + payment.amountCents,
          0
        )

        return {
          id: payable.id,
          receiptId: payable.id,
          source: "payable" as const,
          organizationId: payable.organizationId,
          projectId: payable.projectId,
          supplierId: payable.supplierId ?? undefined,
          allocationId: undefined,
          date: payable.dueDate ?? payable.createdAt,
          createdAt: payable.createdAt,
          taskName: "General",
          projectName,
          supplierName,
          itemDescription: payable.description || payable.title,
          amountCents: payable.amountCents,
          paidCents,
        }
      })
  )

  return [...expenseRows.flat(), ...payableRows].sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  )
}

export async function listPayables(organizationId: string) {
  return db
    .select({
      payable: schema.payable,
      projectName: schema.project.name,
      supplierName: schema.supplier.name,
    })
    .from(schema.payable)
    .leftJoin(schema.project, eq(schema.project.id, schema.payable.projectId))
    .leftJoin(schema.supplier, eq(schema.supplier.id, schema.payable.supplierId))
    .where(eq(schema.payable.organizationId, organizationId))
    .orderBy(desc(schema.payable.createdAt))
}

export async function getPayable(organizationId: string, payableId: string) {
  const [row] = await db
    .select({ payable: schema.payable, projectName: schema.project.name, supplierName: schema.supplier.name })
    .from(schema.payable)
    .leftJoin(schema.project, eq(schema.project.id, schema.payable.projectId))
    .leftJoin(schema.supplier, eq(schema.supplier.id, schema.payable.supplierId))
    .where(and(eq(schema.payable.id, payableId), eq(schema.payable.organizationId, organizationId)))
    .limit(1)
  if (!row) return null
  const payments = await db.select().from(schema.ledgerPayment).where(and(eq(schema.ledgerPayment.payableId, payableId), eq(schema.ledgerPayment.organizationId, organizationId)))
  return { ...row, payments }
}

export async function getExpense(organizationId: string, expenseId: string) {
  const [row] = await db
    .select({ expense: schema.expense, projectName: schema.project.name, supplierName: schema.supplier.name })
    .from(schema.expense)
    .leftJoin(schema.project, eq(schema.project.id, schema.expense.projectId))
    .leftJoin(schema.supplier, eq(schema.supplier.id, schema.expense.supplierId))
    .where(and(eq(schema.expense.id, expenseId), eq(schema.expense.organizationId, organizationId)))
    .limit(1)
  if (!row) return null
  const lines = await db
    .select({ line: schema.expenseLine, allocationName: schema.allocation.name })
    .from(schema.expenseLine)
    .leftJoin(schema.allocation, eq(schema.allocation.id, schema.expenseLine.allocationId))
    .where(and(eq(schema.expenseLine.expenseId, expenseId), eq(schema.expenseLine.organizationId, organizationId)))
  const payments = await db.select().from(schema.ledgerPayment).where(and(eq(schema.ledgerPayment.expenseId, expenseId), eq(schema.ledgerPayment.organizationId, organizationId)))
  return { ...row, lines, payments }
}

export async function getExpenseLines(organizationId: string, expenseId: string) {
  return db
    .select({ line: schema.expenseLine, allocationName: schema.allocation.name })
    .from(schema.expenseLine)
    .leftJoin(schema.allocation, eq(schema.allocation.id, schema.expenseLine.allocationId))
    .where(and(eq(schema.expenseLine.expenseId, expenseId), eq(schema.expenseLine.organizationId, organizationId)))
}

export async function updateExpense(organizationId: string, id: string, data: Partial<typeof schema.expense.$inferInsert>) {
  const [expense] = await db.update(schema.expense).set({ ...data, updatedAt: new Date() }).where(and(eq(schema.expense.id, id), eq(schema.expense.organizationId, organizationId))).returning()
  return expense
}
