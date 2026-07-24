import type { DatabaseExecutor } from "@workspace/db/repositories"
import {
  findActiveProjectForOrganization,
  listAllocationsForProject,
  listArchivedProjectsForOrganization,
  listProjectsForOrganization,
} from "@workspace/db/repositories"
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
  ctx: Pick<WorkspaceContext, "organizationId">,
  deps: { executor: DatabaseExecutor }
): Promise<ProjectFinancialSummary[]> {
  return withProjectFinancials(
    await listProjectsForOrganization(deps.executor, ctx.organizationId),
    ctx,
    deps
  )
}

export async function listArchivedProjectSummariesUseCase(
  ctx: Pick<WorkspaceContext, "organizationId">,
  deps: { executor: DatabaseExecutor }
): Promise<ProjectFinancialSummary[]> {
  return withProjectFinancials(
    await listArchivedProjectsForOrganization(
      deps.executor,
      ctx.organizationId
    ),
    ctx,
    deps
  )
}

export async function getProjectSummaryUseCase(
  ctx: Pick<WorkspaceContext, "organizationId">,
  deps: { executor: DatabaseExecutor },
  projectId: string
): Promise<ProjectFinancialSummary | null> {
  const [row] = await findActiveProjectForOrganization(
    deps.executor,
    ctx.organizationId,
    projectId
  )
  if (!row) return null
  const [result] = await withProjectFinancials([row], ctx, deps)
  return result ?? null
}

async function withProjectFinancials(
  rows: ProjectRow[],
  ctx: Pick<WorkspaceContext, "organizationId">,
  deps: { executor: DatabaseExecutor }
) {
  const expenseRows = await listFinancialExpenseRowsUseCase(ctx, deps)
  return Promise.all(
    rows.map(async (row) => {
      const allocations = await listAllocationsForProject(
        deps.executor,
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
