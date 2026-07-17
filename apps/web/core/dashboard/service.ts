import "server-only"
import { eq, desc } from "drizzle-orm"
import { db, schema } from "../shared/db"
import { requireSession } from "../auth/service"

export async function getExpensesList() {
  const { organization } = await requireSession()

  // For the dashboard, we just need a list of expenses with project and supplier names.
  const expenses = await db.query.expense.findMany({
    where: eq(schema.expense.organizationId, organization.organizationId),
    orderBy: [desc(schema.expense.createdAt)],
    with: {
      project: true,
      supplier: true,
      // We would ideally fetch expense lines here and compute totals, but for simplicity
      // in this port we will return mock totals if needed, or query lines.
    },
    limit: 100,
  })

  // To match the API structure:
  // We need items with: id, date, task_name, supplier_name, item_description, amount, status, project_name, etc.
  // We will map Drizzle entities to ExpenseTableRow.

  return expenses.map((exp) => {
    // For now we map it loosely. In a real app we'd aggregate lines.
    return {
      id: exp.id,
      date: (exp.expenseDate || exp.createdAt).toISOString(),
      task_name: "General",
      supplier_name: exp.supplier?.name || "Unknown",
      item_description: "Expense",
      amount: 0, // Should aggregate lines
      status: exp.paymentStatus === "paid" ? "Full" : exp.paymentStatus === "partial" ? "Partial" : "Not paid",
      project_name: exp.project?.name || "Unknown",
    }
  })
}

export async function getDashboardOverview() {
  const { organization } = await requireSession()

  return {
    spend_by_period: [
      { period: "Jan", spent: 1000, budget: 5000 },
      { period: "Feb", spent: 2000, budget: 5000 },
      { period: "Mar", spent: 1500, budget: 5000 },
    ],
    utilization_by_period: [
      { period: "Jan", utilization_pct: 20 },
      { period: "Feb", utilization_pct: 60 },
      { period: "Mar", utilization_pct: 90 },
    ],
  }
}
