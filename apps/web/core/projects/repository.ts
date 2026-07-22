import "server-only"
import { db, schema } from "@workspace/db"
import { and, desc, eq, isNotNull, isNull } from "drizzle-orm"
import { listFinancialExpenseRows } from "../expenses/repository"

export async function listProjects(organizationId: string) {
  const projects = await db
    .select()
    .from(schema.project)
    .where(
      and(
        eq(schema.project.organizationId, organizationId),
        isNull(schema.project.archivedAt)
      )
    )
    .orderBy(desc(schema.project.createdAt))

  const expenseRows = await listFinancialExpenseRows(organizationId)
  const results = await Promise.all(
    projects.map(async (p) => {
      const allocations = await db
        .select()
        .from(schema.allocation)
        .where(
          and(
            eq(schema.allocation.projectId, p.id),
            eq(schema.allocation.organizationId, organizationId)
          )
        )
      const budgetCents = allocations.reduce((sum, a) => sum + a.budgetCents, 0)
      const spentCents = expenseRows
        .filter((expense) => expense.projectId === p.id)
        .reduce((sum, expense) => sum + expense.amountCents, 0)
      const remainingCents = budgetCents - spentCents

      return {
        ...p,
        budgetCents,
        spentCents,
        remainingCents,
      }
    })
  )

  return results
}

export async function listArchivedProjects(organizationId: string) {
  const projects = await db
    .select()
    .from(schema.project)
    .where(
      and(
        eq(schema.project.organizationId, organizationId),
        isNotNull(schema.project.archivedAt)
      )
    )
    .orderBy(desc(schema.project.archivedAt))

  const expenseRows = await listFinancialExpenseRows(organizationId)
  const results = await Promise.all(
    projects.map(async (p) => {
      const allocations = await db
        .select()
        .from(schema.allocation)
        .where(
          and(
            eq(schema.allocation.projectId, p.id),
            eq(schema.allocation.organizationId, organizationId)
          )
        )
      const budgetCents = allocations.reduce((sum, a) => sum + a.budgetCents, 0)
      const spentCents = expenseRows
        .filter((expense) => expense.projectId === p.id)
        .reduce((sum, expense) => sum + expense.amountCents, 0)
      const remainingCents = budgetCents - spentCents

      return {
        ...p,
        budgetCents,
        spentCents,
        remainingCents,
      }
    })
  )

  return results
}

export async function getProject(organizationId: string, projectId: string) {
  const [project] = await db
    .select()
    .from(schema.project)
    .where(
      and(
        eq(schema.project.id, projectId),
        eq(schema.project.organizationId, organizationId),
        isNull(schema.project.archivedAt)
      )
    )

  if (!project) return null

  const allocations = await db
    .select()
    .from(schema.allocation)
    .where(and(eq(schema.allocation.projectId, project.id), eq(schema.allocation.organizationId, organizationId)))
  const budgetCents = allocations.reduce((sum, a) => sum + a.budgetCents, 0)

  const spentCents = (await listFinancialExpenseRows(organizationId))
    .filter((expense) => expense.projectId === project.id)
    .reduce((sum, expense) => sum + expense.amountCents, 0)
  const remainingCents = budgetCents - spentCents

  return {
    ...project,
    budgetCents,
    spentCents,
    remainingCents,
  }
}

export async function createProject(data: typeof schema.project.$inferInsert) {
  const [project] = await db.insert(schema.project).values(data).returning()
  return project
}

export async function updateProject(
  organizationId: string,
  projectId: string,
  data: Partial<typeof schema.project.$inferInsert>
) {
  const [project] = await db
    .update(schema.project)
    .set({ ...data, updatedAt: new Date() })
    .where(
      and(
        eq(schema.project.id, projectId),
        eq(schema.project.organizationId, organizationId)
      )
    )
    .returning()
  return project
}

export async function deleteProject(organizationId: string, projectId: string) {
  const [project] = await db
    .delete(schema.project)
    .where(
      and(
        eq(schema.project.id, projectId),
        eq(schema.project.organizationId, organizationId)
      )
    )
    .returning()
  return project
}
