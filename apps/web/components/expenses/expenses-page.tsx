import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"

import { DashboardShell } from "@/components/shared/dashboard-shell"
import { ExpenseTable } from "@/components/shared/expense-table"
import { formatCurrency } from "@/lib/format"
import type { DashboardOverviewData } from "@/lib/types"

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
      <div className="min-w-0 pb-2">
        <Tabs defaultValue={expenseFilters[0]} className="min-w-0">
          <div className="overflow-x-auto pb-2">
            <TabsList className="min-w-max">
              {expenseFilters.map((filter) => (
                <TabsTrigger key={filter} value={filter}>
                  {filter}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>
      </div>
      <div className="mb-2 grid grid-cols-2 gap-3 lg:grid-cols-3">
        <div className="col-span-2 lg:col-span-1">
          <ExpenseMetric
            detail="Current period"
            label="This month"
            value={formatCurrency(totalSpent)}
          />
        </div>
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
        <CardTitle className="font-medium text-muted-foreground text-xs">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="font-heading font-semibold text-base text-primary">
          {value}
        </div>
        <p className="mt-1 text-[10px] text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  )
}
