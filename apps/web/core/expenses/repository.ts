import "server-only"

import { db, schema } from "@workspace/db"
import { deletePayableForOrganization, deleteReceiptForOrganization, findExpenseForOrganization, findPayableForOrganization, listExpensesForOrganization, listPayablesForOrganization, listReceiptLinesWithAllocation, updateReceiptForOrganization, updateReceiptLinesAllocation } from "@workspace/db/repositories"
import { and, desc, eq, sql } from "drizzle-orm"

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
  paymentStatus?: string
  categoryState: "assigned" | "uncategorized"
}

export async function listExpenses(organizationId: string, projectId?: string) {
  return listExpensesForOrganization(db, organizationId, projectId)
}

export async function listFinancialExpenseRows(
  organizationId: string,
  projectId?: string
): Promise<FinancialExpenseRow[]> {
  const rows = await listExpenses(organizationId, projectId)
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
            ? Math.round(
                (receiptPaidCents * line.amountCents) / receiptTotalCents
              )
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
          paymentStatus: expense.paymentStatus,
          categoryState: allocationName ? ("assigned" as const) : ("uncategorized" as const),
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
          taskName: "Uncategorized",
          projectName,
          supplierName,
          itemDescription: payable.description || payable.title,
          amountCents: payable.amountCents,
          paidCents,
          paymentStatus: payable.status,
          categoryState: "uncategorized" as const,
        }
      })
  )

  return [...expenseRows.flat(), ...payableRows].sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  )
}

export async function listPayables(organizationId: string) {
  return listPayablesForOrganization(db, organizationId)
}

export async function getPayable(organizationId: string, payableId: string) {
  return findPayableForOrganization(db, organizationId, payableId)
}

export async function getExpense(organizationId: string, expenseId: string) {
  return findExpenseForOrganization(db, organizationId, expenseId)
}

export async function updateExpenseLinesAllocation(organizationId: string, expenseId: string, allocationId: string) {
  return updateReceiptLinesAllocation(db, organizationId, expenseId, allocationId)
}

export async function deleteExpense(organizationId: string, expenseId: string) {
  return deleteReceiptForOrganization(db, organizationId, expenseId).then(([deleted]) => deleted ?? null)
}

export async function deletePayable(organizationId: string, payableId: string) {
  return deletePayableForOrganization(db, organizationId, payableId).then((deleted) => deleted ?? null)
}

export async function getExpenseLines(organizationId: string, expenseId: string) {
  return listReceiptLinesWithAllocation(db, organizationId, expenseId)
}

export async function updateExpense(organizationId: string, id: string, data: Partial<typeof schema.expense.$inferInsert>) {
  return updateReceiptForOrganization(db, organizationId, id, data)
}
