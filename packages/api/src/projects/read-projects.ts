import { db } from "@workspace/db"

import { findActiveProjectForOrganization, listAllocationsForProject, listArchivedProjectsForOrganization, listProjectsForOrganization } from "@workspace/db/projects"
import { listFinancialExpenseRowsUseCase } from "../receipts/financial-expenses"
import type { WorkspaceContext } from "../shared/workspace-context"

type ProjectRow = Awaited<
  ReturnType<typeof listProjectsForOrganization>
>[number]

export type ProjectFinancialSummary = ProjectRow & {
  budgetCents: number
  spentCents: number
  remainingCents: number
}

export async function listProjectSummariesUseCase(
  ctx: Pick<WorkspaceContext, "organizationId">
): Promise<ProjectFinancialSummary[]> {
  return withProjectFinancials(
    await listProjectsForOrganization(db, ctx.organizationId),
    ctx
  )
}

export async function listArchivedProjectSummariesUseCase(
  ctx: Pick<WorkspaceContext, "organizationId">
): Promise<ProjectFinancialSummary[]> {
  return withProjectFinancials(
    await listArchivedProjectsForOrganization(db, ctx.organizationId),
    ctx
  )
}

export async function getProjectSummaryUseCase(
  ctx: Pick<WorkspaceContext, "organizationId">,
  projectId: string
): Promise<ProjectFinancialSummary | null> {
  const [row] = await findActiveProjectForOrganization(
    db,
    ctx.organizationId,
    projectId
  )
  if (!row) return null
  const [result] = await withProjectFinancials([row], ctx)
  return result ?? null
}

async function withProjectFinancials(
  rows: ProjectRow[],
  ctx: Pick<WorkspaceContext, "organizationId">
) {
  const expenseRows = await listFinancialExpenseRowsUseCase(ctx)
  return Promise.all(
    rows.map(async (row) => {
      const allocations = await listAllocationsForProject(
        db,
        ctx.organizationId,
        row.id
      )
      const budgetCents = allocations.reduce(
        (sum, item) => sum + item.budgetCents,
        0
      )
      const spentCents = expenseRows
        .filter((expense) => expense.projectId === row.id)
        .reduce((sum, expense) => sum + expense.amountCents, 0)
      return {
        ...row,
        budgetCents,
        spentCents,
        remainingCents: budgetCents - spentCents,
      }
    })
  )
}
