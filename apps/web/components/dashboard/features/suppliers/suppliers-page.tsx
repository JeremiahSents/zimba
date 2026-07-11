import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { SupplierTable } from "@/components/dashboard/features/suppliers/supplier-table"
import { formatCurrency } from "@/lib/zimba/format"
import type { DashboardOverviewData } from "@/lib/zimba/types"

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
    [
      "Active suppliers",
      String(data.suppliers.length),
      "Currently linked to projects",
    ],
    ["Paid this month", formatCurrency(totalPaid), "Across all suppliers"],
    [
      "Top supplier",
      topSupplier?.name ?? "—",
      topSupplier ? formatCurrency(topSupplier.amount) : "No payments yet",
    ],
  ]
  return (
    <DashboardShell
      title="Suppliers"
      subtitle="Track vendor spend, payment volume, and current exposure."
      dataSource={data.source}
    >
      <Card className="gap-0 py-0">
        <div className="grid md:grid-cols-3">
          {stats.map(([label, value, detail]) => (
            <div
              key={label}
              className="border-t p-5 first:border-t-0 md:border-t-0 md:border-l md:first:border-l-0"
            >
              <p className="text-xs font-medium text-foreground">{label}</p>
              <p className="mt-5 font-heading text-base font-semibold text-foreground">
                {value}
              </p>
              <p className="mt-1 text-[10px] text-muted-foreground">{detail}</p>
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
