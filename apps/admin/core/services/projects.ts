import "server-only"
import { db } from "@workspace/db"
import { project } from "@workspace/db/schema"
import { desc } from "drizzle-orm"

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

  return projects.map(p => ({
    ...p,
    receiptCount: p.expenses.length,
    organizationName: p.organization?.name || "Unknown"
  }))
}
