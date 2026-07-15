"use client"

import {
  MoneyBag02Icon,
  TaskDone01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@workspace/ui/components/button"
import { Card } from "@workspace/ui/components/card"
import Link from "next/link"
import { useMemo, useState } from "react"

import { DashboardShell } from "@/components/shared/dashboard-shell"
import { SupplierTable } from "@/components/suppliers/supplier-table"
import { formatCurrency } from "@/lib/format"
import {
  getSupplierListItems,
  type SupplierListItem,
} from "@/lib/supplier-data"
import type { DashboardOverviewData } from "@/lib/types"

export function SuppliersPage({ data }: { data: DashboardOverviewData }) {
  const [paymentFilter, setPaymentFilter] = useState<
    "all" | "Full" | "Partial" | "Not paid"
  >("all")
  const suppliers = useMemo<SupplierListItem[]>(
    () => getSupplierListItems(data.suppliers, data.expenses),
    [data.expenses, data.suppliers]
  )
  const totalReceiptValue = suppliers.reduce(
    (sum, supplier) => sum + supplier.amount,
    0
  )
  const totalPaid = suppliers.reduce((sum, supplier) => sum + supplier.paid, 0)
  const pendingBalance = totalReceiptValue - totalPaid
  const filteredSuppliers =
    paymentFilter === "all"
      ? suppliers
      : suppliers.filter(
          (supplier) => supplier.statusSummary[paymentFilter] > 0
        )
  const stats = [
    {
      label: "Suppliers we have",
      value: String(suppliers.length),
      detail: "Active partners",
      icon: UserGroupIcon,
      pillClassName: "bg-green-50 text-green-700",
    },
    {
      label: "Receipt value",
      value: formatCurrency(totalReceiptValue),
      detail: "Across all receipts",
      icon: MoneyBag02Icon,
      pillClassName: "bg-blue-50 text-blue-700",
    },
    {
      label: "Paid to suppliers",
      value: formatCurrency(totalPaid),
      detail: `${Math.round((totalPaid / totalReceiptValue) * 100)}% settled`,
      icon: TaskDone01Icon,
      pillClassName: "bg-amber-50 text-amber-700",
    },
    {
      label: "Pending balance",
      value: formatCurrency(pendingBalance),
      detail: "Unpaid arrears",
      icon: MoneyBag02Icon,
      pillClassName: "bg-rose-50 text-rose-700",
    },
  ]
  const filterLabel =
    paymentFilter === "all"
      ? "All receipts"
      : paymentFilter === "Not paid"
        ? "Unpaid"
        : paymentFilter === "Full"
          ? "Fully paid"
          : "Partial"

  return (
    <DashboardShell
      title="Suppliers"
      subtitle="Track receipts, payments, and the balance owed to every supplier."    >
      <Card className="gap-0 overflow-hidden py-0">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="border-t p-4 first:border-t-0 even:border-l md:border-t-0 md:border-l md:p-5 md:first:border-l-0"
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

      <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-heading font-medium text-lg">Supplier ledger</p>
            <p className="mt-1 text-muted-foreground text-sm">
              Receipt value and outstanding balances across active projects.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-muted-foreground text-xs">
              Show
              <select
                value={paymentFilter}
                onChange={(event) =>
                  setPaymentFilter(event.target.value as typeof paymentFilter)
                }
                className="h-9 rounded-lg border bg-background px-3 font-medium text-foreground outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All receipts</option>
                <option value="Full">Fully paid</option>
                <option value="Partial">Partial</option>
                <option value="Not paid">Unpaid</option>
              </select>
            </label>
            <Button
              size="sm"
              nativeButton={false}
              render={<Link href="/admin/suppliers/new" />}
            >
              + Create supplier
            </Button>
          </div>
        </div>
        <SupplierTable
          suppliers={filteredSuppliers}
          filterLabel={filterLabel}
        />
      </section>
    </DashboardShell>
  )
}
