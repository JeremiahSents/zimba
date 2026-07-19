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
import { useMemo } from "react"

import { DashboardShell } from "@/components/shared/dashboard-shell"
import { SupplierTable } from "@/components/suppliers/supplier-table"
import { formatCurrency } from "@/lib/format"
import {
  getSupplierListItems,
  getSupplierReceiptRows,
  type SupplierListItem,
} from "@/lib/supplier-data"
import type { DashboardOverviewData } from "@/lib/types"

export function SuppliersPage({ data }: { data: DashboardOverviewData }) {
  const suppliers = useMemo<SupplierListItem[]>(
    () => getSupplierListItems(data.suppliers, data.expenses),
    [data.suppliers, data.expenses]
  )
  const receipts = useMemo(
    () => getSupplierReceiptRows(data.suppliers, data.expenses),
    [data.suppliers, data.expenses]
  )
  const totalReceiptValue = suppliers.reduce(
    (sum, supplier) => sum + supplier.amount,
    0
  )
  const totalPaid = suppliers.reduce((sum, supplier) => sum + supplier.paid, 0)
  const pendingBalance = totalReceiptValue - totalPaid
  const stats = [
    {
      label: "Suppliers we have",
      value: String(suppliers.length),
      icon: UserGroupIcon,
    },
    {
      label: "Receipt value",
      value: formatCurrency(totalReceiptValue),
      icon: MoneyBag02Icon,
    },
    {
      label: "Paid to suppliers",
      value: formatCurrency(totalPaid),
      icon: TaskDone01Icon,
    },
    {
      label: "Pending balance",
      value: formatCurrency(pendingBalance),
      icon: MoneyBag02Icon,
    },
  ]

  return (
    <DashboardShell title="Suppliers" subtitle="">
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
            </div>
          ))}
        </div>
      </Card>

      <section className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="font-heading font-medium text-lg">Supplier ledger</p>
          <Button
            size="sm"
            nativeButton={false}
            render={<Link href="/admin/suppliers/new" />}
          >
            + Create supplier
          </Button>
        </div>
        <SupplierTable receipts={receipts} suppliers={suppliers} />
      </section>
    </DashboardShell>
  )
}
