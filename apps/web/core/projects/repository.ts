import "server-only"
import { eq, and, sql, getTableColumns, desc } from "drizzle-orm"
import { db, schema } from "../shared/db"

export async function listProjects(organizationId: string) {
  const projects = await db
    .select()
    .from(schema.project)
    .where(eq(schema.project.organizationId, organizationId))
    .orderBy(desc(schema.project.createdAt))

  // For now, we will compute totals in JS or use subqueries.
  // Using subqueries for budget and spent.
  
  const results = await Promise.all(projects.map(async (p) => {
    const allocations = await db.select().from(schema.allocation).where(eq(schema.allocation.projectId, p.id))
    const budgetCents = allocations.reduce((sum, a) => sum + a.budgetCents, 0)
    
    // We should compute spent from expenses later when expenses are implemented fully.
    // For now, spent = 0.
    const spentCents = 0
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
  
  // Wait, I should also fetch expenses and compute spent.
  // I will leave spent at 0 for now until I implement expenses slice.
  const spentCents = 0
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
