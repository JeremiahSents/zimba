import {
  MoneyBag02Icon,
  TaskDone01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

import { DashboardShell } from "@/components/shared/dashboard-shell"
import { SupplierTable } from "@/components/suppliers/supplier-table"
import { formatCurrency } from "@/lib/format"
import type { DashboardOverviewData } from "@/lib/types"

export function SuppliersPage({ data }: { data: DashboardOverviewData }) {
  const totalPaid = data.suppliers.reduce(
    (sum, supplier) => sum + supplier.amount,
    0
  )
  const topSupplier = data.suppliers.reduce(
    (top, supplier) => (!top || supplier.amount > top.amount ? supplier : top),
    data.suppliers[0]
  )
  const stats = [
    {
      label: "Active suppliers",
      value: String(data.suppliers.length),
      detail: "Active",
      icon: UserGroupIcon,
      pillClassName: "bg-green-50 text-green-700",
    },
    {
      label: "Paid this month",
      value: formatCurrency(totalPaid),
      detail: "Payments",
      icon: MoneyBag02Icon,
      pillClassName: "bg-amber-50 text-amber-700",
    },
    {
      label: "Top supplier",
      value: topSupplier?.name ?? "—",
      detail: topSupplier ? formatCurrency(topSupplier.amount) : "No payments",
      icon: TaskDone01Icon,
      pillClassName: "bg-blue-50 text-blue-700",
    },
  ]

  return (
    <DashboardShell
      title="Suppliers"
      subtitle="Track vendor spend, payment volume, and current exposure."
      dataSource={data.source}
    >
      <Card className="gap-0 py-0">
        <div className="grid md:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="border-t p-5 first:border-t-0 md:border-t-0 md:border-l md:first:border-l-0"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-muted-foreground text-xs">
                  {stat.label}
                </p>
                <HugeiconsIcon
                  icon={stat.icon}
                  strokeWidth={1.6}
                  className="size-4 text-primary"
                />
              </div>
              <p className="mt-4 font-heading font-semibold text-base text-foreground">
                {stat.value}
              </p>
              <p
                className={`mt-2 inline-flex rounded-lg px-1.5 py-0.5 font-medium text-[10px] ${stat.pillClassName}`}
              >
                {stat.detail}
              </p>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>All suppliers</CardTitle>
          <CardDescription>
            Vendor payment activity across active projects.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SupplierTable suppliers={data.suppliers} />
        </CardContent>
      </Card>
    </DashboardShell>
  )
}
