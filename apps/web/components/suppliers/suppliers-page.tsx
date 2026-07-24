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
import { useWorkspaceSlug } from "@/components/shared/use-workspace-slug"
import { formatCurrency } from "@/lib/format"
import {
  getSupplierListItems,
  type SupplierListItem,
} from "@/lib/supplier-data"
import type { DashboardOverviewData } from "@/lib/types"

export function SuppliersPage({ data }: { data: DashboardOverviewData }) {
  const slug = useWorkspaceSlug()
  const suppliers = useMemo<SupplierListItem[]>(
    () => getSupplierListItems(data.suppliers, data.expenses),
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
          <p className="font-heading font-medium text-lg">All suppliers</p>
          <Button
            size="sm"
            nativeButton={false}
            render={<Link href={`/${slug}/suppliers/new`} />}
          >
            + Create supplier
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {suppliers.map((supplier) => {
            const id = supplier.id ?? supplier.supplier_id
            const latest = data.expenses
              .filter((expense) => expense.supplier_id === id)
              .sort((a, b) => b.date.localeCompare(a.date))[0]
            return (
              <Link
                key={id ?? supplier.name}
                href={`/${slug}/suppliers/${id ?? supplier.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                className="rounded-2xl border bg-card p-5 shadow-sm transition hover:border-primary/35 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate font-heading font-semibold text-base">
                      {supplier.name}
                    </h2>
                    <p className="mt-1 truncate text-muted-foreground text-xs">
                      {supplier.contactName ??
                        supplier.phone ??
                        "No contact details"}
                    </p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-2 py-1 font-semibold text-[10px] text-primary">
                    {supplier.payments} receipts
                  </span>
                </div>
                <dl className="mt-5 grid grid-cols-3 gap-2 border-y py-4">
                  <Metric
                    label="Incurred"
                    value={formatCurrency(supplier.amount)}
                  />
                  <Metric label="Paid" value={formatCurrency(supplier.paid)} />
                  <Metric
                    label="Balance"
                    value={formatCurrency(supplier.remaining)}
                  />
                </dl>
                <p className="mt-4 text-muted-foreground text-xs">
                  {latest
                    ? `Latest receipt ${new Intl.DateTimeFormat("en-UG", { dateStyle: "medium" }).format(new Date(latest.date))}`
                    : "No receipts yet"}
                </p>
              </Link>
            )
          })}
        </div>
      </section>
    </DashboardShell>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] text-muted-foreground uppercase tracking-wide">
        {label}
      </dt>
      <dd className="mt-1 truncate font-semibold text-xs tabular-nums">
        {value}
      </dd>
    </div>
  )
}
