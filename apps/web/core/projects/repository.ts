import "server-only"
import { db } from "@workspace/db"
import { allocation, project } from "@workspace/db/schema"
import {
  createProject as insertProject,
  deleteProjectForOrganization,
  findActiveProjectForOrganization,
  listAllocationsForProject,
  listArchivedProjectsForOrganization,
  listProjectsForOrganization,
  updateProjectForOrganization,
} from "@workspace/db/repositories"
import { listFinancialExpenseRows } from "../expenses/repository"

async function withProjectFinancials(
  rows: Array<typeof project.$inferSelect>,
  organizationId: string
) {
  const expenseRows = await listFinancialExpenseRows(organizationId)
  return Promise.all(
    rows.map(async (row) => {
      const allocations = await listAllocationsForProject(
        db,
        organizationId,
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

export async function listProjects(organizationId: string) {
  return withProjectFinancials(
    await listProjectsForOrganization(db, organizationId),
    organizationId
  )
}

export async function listArchivedProjects(organizationId: string) {
  return withProjectFinancials(
    await listArchivedProjectsForOrganization(db, organizationId),
    organizationId
  )
}

export async function getProject(organizationId: string, projectId: string) {
  const [row] = await findActiveProjectForOrganization(
    db,
    organizationId,
    projectId
  )
  if (!row) return null
  const [result] = await withProjectFinancials([row], organizationId)
  return result
}

export function createProject(data: typeof project.$inferInsert) {
  return insertProject(db, data)
}
export function updateProject(
  organizationId: string,
  projectId: string,
  data: Partial<typeof project.$inferInsert>
) {
  return updateProjectForOrganization(db, organizationId, projectId, data)
}
export function deleteProject(organizationId: string, projectId: string) {
  return deleteProjectForOrganization(db, organizationId, projectId)
}
