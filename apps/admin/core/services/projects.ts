import "server-only"
import { db } from "@workspace/db"
import { project, expense, expenseLine } from "@workspace/db/schema"
import { desc, eq, sql } from "drizzle-orm"

export async function listPlatformProjects() {
  const projects = await db.query.project.findMany({
    orderBy: [desc(project.createdAt)],
    with: {
      organization: {
        columns: { name: true }
      },
      expenses: {
        columns: { id: true }
      }
    }
  })

  const spendStats = await db
    .select({
      projectId: expense.projectId,
      totalSpendCents: sql<number>`coalesce(sum(${expenseLine.amountCents}), 0)`,
    })
    .from(expense)
    .leftJoin(expenseLine, eq(expense.id, expenseLine.expenseId))
    .where(sql`${expense.projectId} is not null`)
    .groupBy(expense.projectId)

  const spendMap = new Map(spendStats.map((s) => [s.projectId, s.totalSpendCents]))

  return projects.map((p) => ({
    ...p,
    receiptCount: p.expenses.length,
    organizationName: p.organization?.name || "Unknown",
    totalSpendCents: (p.id && spendMap.get(p.id)) ?? 0,
  }))
}
