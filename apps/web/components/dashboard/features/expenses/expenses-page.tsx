import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ExpenseTable } from "@/components/dashboard/shared/expense-table"
import { formatCurrency } from "@/lib/zimba/format"
import type { DashboardOverviewData } from "@/lib/zimba/types"

const expenseFilters = ["All expenses", "This week", "Labour", "Materials"]

export function ExpensesPage({ data }: { data: DashboardOverviewData }) {
  const totalSpent = data.expenses.reduce(
    (total, expense) => total + expense.amount,
    0
  )
  const largestExpense = Math.max(
    0,
    ...data.expenses.map((expense) => expense.amount)
  )

  return (
    <DashboardShell
      title="Expenses"
      subtitle="Review payments, tasks, suppliers, and site spend."
      dataSource={data.source}
    >
      <div className="flex items-center justify-between pb-4">
        <Tabs defaultValue={expenseFilters[0]}>
          <TabsList>
            {expenseFilters.map((filter) => (
              <TabsTrigger key={filter} value={filter}>
                {filter}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <ExpenseMetric
          detail="Current period"
          label="This month"
          value={formatCurrency(totalSpent)}
        />
        <ExpenseMetric
          detail="Needs attention"
          label="Pending approval"
          value={formatCurrency(42_000_000)}
        />
        <ExpenseMetric
          detail="Largest logged item"
          label="Largest item"
          value={formatCurrency(largestExpense)}
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent expenses</CardTitle>
          <CardDescription>
            Latest payments logged across active projects.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ExpenseTable expenses={data.expenses} />
        </CardContent>
      </Card>
    </DashboardShell>
  )
}

function ExpenseMetric({
  detail,
  label,
  value,
}: {
  detail: string
  label: string
  value: string
}) {
  return (
    <Card tone="keylime">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="font-heading text-base font-semibold text-primary">
          {value}
        </div>
        <p className="mt-1 text-[10px] text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  )
}
