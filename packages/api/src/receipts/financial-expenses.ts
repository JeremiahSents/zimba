import type { DatabaseExecutor } from "@workspace/db/repositories"
import {
  findExpenseForOrganization,
  findPayableForOrganization,
  listExpensesForOrganization,
  listPayablePaymentsForPayables,
  listPayablesForOrganization,
  listReceiptLinesWithAllocationForExpenses,
  listReceiptPaymentsForExpenses,
} from "@workspace/db/repositories"
import type { WorkspaceContext } from "../shared/workspace-context"

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

export async function listFinancialExpenseRowsUseCase(
  ctx: Pick<WorkspaceContext, "organizationId">,
  deps: { executor: DatabaseExecutor },
  projectId?: string
): Promise<FinancialExpenseRow[]> {
  const rows = await listExpensesForOrganization(
    deps.executor,
    ctx.organizationId,
    projectId
  )
  const payables = await listPayablesForOrganization(
    deps.executor,
    ctx.organizationId
  )
  const expenseIds = rows.map(({ expense }) => expense.id)
  const currentExpenseIds = new Set(rows.map(({ expense }) => expense.id))
  const legacyPayableIds = payables
    .filter(({ payable }) => !currentExpenseIds.has(payable.id))
    .map(({ payable }) => payable.id)

  const [expenseLines, expensePayments, payablePayments] = await Promise.all([
    listReceiptLinesWithAllocationForExpenses(
      deps.executor,
      ctx.organizationId,
      expenseIds
    ),
    listReceiptPaymentsForExpenses(
      deps.executor,
      ctx.organizationId,
      expenseIds
    ),
    listPayablePaymentsForPayables(
      deps.executor,
      ctx.organizationId,
      legacyPayableIds
    ),
  ])

  const linesByExpenseId = new Map<string, typeof expenseLines>()
  for (const lineRow of expenseLines) {
    const lineRows = linesByExpenseId.get(lineRow.line.expenseId) ?? []
    lineRows.push(lineRow)
    linesByExpenseId.set(lineRow.line.expenseId, lineRows)
  }

  const paymentsByExpenseId = new Map<string, typeof expensePayments>()
  for (const payment of expensePayments) {
    if (payment.expenseId) {
      const payments = paymentsByExpenseId.get(payment.expenseId) ?? []
      payments.push(payment)
      paymentsByExpenseId.set(payment.expenseId, payments)
    }
    if (payment.payableId && payment.payableId !== payment.expenseId) {
      const payments = paymentsByExpenseId.get(payment.payableId) ?? []
      payments.push(payment)
      paymentsByExpenseId.set(payment.payableId, payments)
    }
  }

  const paymentsByPayableId = new Map<string, typeof payablePayments>()
  for (const payment of payablePayments) {
    if (!payment.payableId) continue
    const payments = paymentsByPayableId.get(payment.payableId) ?? []
    payments.push(payment)
    paymentsByPayableId.set(payment.payableId, payments)
  }

  const expenseRows = rows.map(({ expense, projectName, supplierName }) => {
    const lines = linesByExpenseId.get(expense.id) ?? []
    const payments = paymentsByExpenseId.get(expense.id) ?? []
    const receiptTotalCents = lines.reduce(
      (sum, { line }) => sum + line.amountCents,
      0
    )
    const receiptPaidCents = payments.reduce(
      (sum, payment) => sum + payment.amountCents,
      0
    )

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
        categoryState: allocationName
          ? ("assigned" as const)
          : ("uncategorized" as const),
      }
    })
  })

  const payableRows = payables
    .filter(({ payable }) => !currentExpenseIds.has(payable.id))
    .map(({ payable, projectName, supplierName }) => {
      const paidCents = (paymentsByPayableId.get(payable.id) ?? []).reduce(
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

  return [...expenseRows.flat(), ...payableRows].sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  )
}

export function getExpenseDetailUseCase(
  ctx: Pick<WorkspaceContext, "organizationId">,
  deps: { executor: DatabaseExecutor },
  expenseId: string
) {
  return findExpenseForOrganization(
    deps.executor,
    ctx.organizationId,
    expenseId
  )
}

export function getPayableDetailUseCase(
  ctx: Pick<WorkspaceContext, "organizationId">,
  deps: { executor: DatabaseExecutor },
  payableId: string
) {
  return findPayableForOrganization(
    deps.executor,
    ctx.organizationId,
    payableId
  )
}
