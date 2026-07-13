import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { SpendBarChart } from "@/components/dashboard/spend-bar-chart"
import { UtilizationAreaChart } from "@/components/dashboard/utilization-area-chart"
import { DashboardShell } from "@/components/shared/dashboard-shell"
import { ExpenseTable } from "@/components/shared/expense-table"
import { formatCurrency, formatPercent } from "@/lib/format"
import type { DashboardOverviewData } from "@/lib/types"

export function AnalyticsPage({ data }: { data: DashboardOverviewData }) {
  const totalBudget = data.projects.reduce(
    (sum, project) => sum + project.budget,
    0
  )
  const totalSpent = data.projects.reduce(
    (sum, project) => sum + project.spent,
    0
  )
  const utilization = totalBudget ? (totalSpent / totalBudget) * 100 : 0

  return (
    <DashboardShell title="Analytics" subtitle="" dataSource={data.source}>
      <section className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 font-semibold text-[10px] text-primary uppercase tracking-[0.16em]">
            Portfolio performance
          </p>
          <h2 className="font-heading font-semibold text-xl tracking-tight">
            Spending and budget health
          </h2>
          <p className="mt-2 text-muted-foreground text-xs">
            Compare project spend and review every recorded expense.
          </p>
        </div>
        <Button size="sm">Export analytics</Button>
      </section>

      <Card className="gap-0 py-0">
        <div className="grid sm:grid-cols-3">
          {[
            ["Portfolio budget", formatCurrency(totalBudget)],
            ["Spent to date", formatCurrency(totalSpent)],
            ["Budget used", formatPercent(utilization)],
          ].map(([label, value]) => (
            <div
              key={label}
              className="border-t p-5 first:border-t-0 sm:border-t-0 sm:border-l sm:first:border-l-0"
            >
              <p className="font-medium text-muted-foreground text-xs">
                {label}
              </p>
              <p className="mt-4 font-heading font-semibold text-base tracking-tight">
                {value}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SpendBarChart data={data.spendChart} />
        </div>
        <UtilizationAreaChart data={data.utilizationChart} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All expenses</CardTitle>
          <CardDescription>
            Search and review expenses across every active project.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ExpenseTable expenses={data.expenses} />
        </CardContent>
      </Card>
    </DashboardShell>
  )
}
