import "server-only"
import { and, desc, eq, inArray, isNull } from "drizzle-orm"
import { db, schema } from "@workspace/db"

export async function listProjects(organizationId: string) {
  const projects = await db
    .select()
    .from(schema.project)
    .where(and(eq(schema.project.organizationId, organizationId), isNull(schema.project.archivedAt)))
    .orderBy(desc(schema.project.createdAt))

  const results = await Promise.all(projects.map(async (p) => {
    const allocations = await db.select().from(schema.allocation).where(and(eq(schema.allocation.projectId, p.id), eq(schema.allocation.organizationId, organizationId)))
    const budgetCents = allocations.reduce((sum, a) => sum + a.budgetCents, 0)
    const projectExpenses = await db.select({ id: schema.expense.id }).from(schema.expense).where(and(eq(schema.expense.projectId, p.id), eq(schema.expense.organizationId, organizationId)))
    const lines = projectExpenses.length ? await db.select({ amountCents: schema.expenseLine.amountCents }).from(schema.expenseLine).where(and(inArray(schema.expenseLine.expenseId, projectExpenses.map((expense) => expense.id)), eq(schema.expenseLine.organizationId, organizationId))) : []
    const spentCents = lines.reduce((sum, line) => sum + line.amountCents, 0)
    const remainingCents = budgetCents - spentCents

    return {
      ...p,
      budgetCents,
      spentCents,
      remainingCents,
    }
  }))

  return results
}

export async function getProject(organizationId: string, projectId: string) {
  const [project] = await db
    .select()
    .from(schema.project)
    .where(
      and(
        eq(schema.project.id, projectId),
        eq(schema.project.organizationId, organizationId)
      )
    )

  if (!project) return null

  const allocations = await db.select().from(schema.allocation).where(eq(schema.allocation.projectId, project.id))
  const budgetCents = allocations.reduce((sum, a) => sum + a.budgetCents, 0)
  
  const projectExpenses = await db.select({ id: schema.expense.id }).from(schema.expense).where(and(eq(schema.expense.projectId, project.id), eq(schema.expense.organizationId, organizationId)))
  const lines = projectExpenses.length ? await db.select({ amountCents: schema.expenseLine.amountCents }).from(schema.expenseLine).where(and(inArray(schema.expenseLine.expenseId, projectExpenses.map((expense) => expense.id)), eq(schema.expenseLine.organizationId, organizationId))) : []
  const spentCents = lines.reduce((sum, line) => sum + line.amountCents, 0)
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

export async function updateProject(organizationId: string, projectId: string, data: Partial<typeof schema.project.$inferInsert>) {
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
