import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Progress } from "@workspace/ui/components/progress"
import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ActivityRow } from "@/components/dashboard/shared/activity-row"
import { initials } from "@/components/dashboard/shared/initials"
import { formatCurrency } from "@/lib/zimba/format"
import type { DashboardOverviewData } from "@/lib/zimba/types"

const supplierFilters = ["All suppliers", "Top paid", "Materials", "Services"]

export function SuppliersPage({ data }: { data: DashboardOverviewData }) {
  const largestSupplierAmount = Math.max(
    1,
    ...data.suppliers.map((supplier) => supplier.amount)
  )

  return (
    <DashboardShell
      title="Suppliers"
      subtitle="Track vendor spend, payment volume, and current exposure."
      dataSource={data.source}
    >
      <div className="flex items-center justify-between pb-4">
        <Tabs defaultValue={supplierFilters[0]}>
          <TabsList>
            {supplierFilters.map((filter) => (
              <TabsTrigger key={filter} value={filter}>
                {filter}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {data.suppliers.map((supplier) => (
          <Card key={supplier.name} tone="keylime">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar className="size-10">
                    <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                      {initials(supplier.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <CardTitle className="truncate">{supplier.name}</CardTitle>
                    <CardDescription>
                      {supplier.payments} payments
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline">Active</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Paid this month</p>
                <p className="font-heading text-2xl font-semibold">
                  {formatCurrency(supplier.amount)}
                </p>
              </div>
              <Progress
                value={(supplier.amount / largestSupplierAmount) * 100}
              />
              <p className="text-sm text-muted-foreground">
                Next payment review scheduled with project accountant.
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Supplier activity</CardTitle>
          <CardDescription>Recent project-linked transactions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.expenses.slice(0, 3).map((expense) => (
            <ActivityRow
              key={expense.id}
              title={expense.supplier_name}
              detail={`${expense.project_name} - ${expense.item_description}`}
              value={formatCurrency(expense.amount)}
            />
          ))}
        </CardContent>
      </Card>
    </DashboardShell>
  )
}
