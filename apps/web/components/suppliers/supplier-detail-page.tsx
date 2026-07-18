import {
  Call02Icon,
  Mail01Icon,
  MapsLocation01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { DashboardShell } from "@/components/shared/dashboard-shell"
import { formatCurrency, formatShortDate } from "@/lib/format"
import {
  getSupplierLedger,
  getSupplierListItems,
  getSupplierProfile,
  type SupplierPaymentStatus,
} from "@/lib/supplier-data"
import type { ExpenseTableRow, SupplierResponse } from "@/lib/types"

const statusStyles: Record<SupplierPaymentStatus, string> = {
  Full: "bg-green-50 text-green-700",
  Partial: "bg-amber-50 text-amber-700",
  "Not paid": "bg-rose-50 text-rose-700",
}

export function SupplierDetailPage({
  supplier: supplierRecord,
  expenses,
}: {
  supplier: SupplierResponse
  expenses: ExpenseTableRow[]
}) {
  const [supplier] = getSupplierListItems([supplierRecord], expenses)
  if (!supplier) return null
  const profile = getSupplierProfile(supplier.name, supplier)
  const ledger = getSupplierLedger(supplierRecord, expenses)
  const totalReceipts = ledger.reduce(
    (sum, entry) => sum + entry.receiptValue,
    0
  )
  const statusTotals = (
    Object.keys(statusStyles) as SupplierPaymentStatus[]
  ).map((status) => ({
    status,
    count: ledger.filter((entry) => entry.status === status).length,
    value: ledger
      .filter((entry) => entry.status === status)
      .reduce((sum, entry) => sum + entry.receiptValue, 0),
  }))
  const initials = supplier.name
    .split(/\s|\//)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <DashboardShell title={supplier.name} subtitle="">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/suppliers">
                  Suppliers
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{supplier.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h2 className="mt-2 font-heading font-semibold text-xl">
            Supplier profile
          </h2>
          <p className="mt-1 text-muted-foreground text-xs">
            Profile, receipts and payment activity for this supplier.
          </p>
        </div>
        <span className="rounded-full bg-green-50 px-2.5 py-1 font-medium text-green-700 text-xs">
          Active supplier
        </span>
      </div>
      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card className="border-primary/15 bg-primary/[0.03]">
          <CardContent className="flex flex-wrap items-center gap-4 p-6">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-primary font-heading font-semibold text-primary-foreground text-xl">
              {initials}
            </div>
            <div>
              <p className="font-heading font-semibold text-2xl tracking-tight">
                {supplier.name}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full border border-primary/35 bg-background px-2.5 py-1 font-medium text-primary text-xs capitalize">
                  {supplier.category}
                </span>
                <span className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground text-xs">
                  {supplier.payments} recorded payments
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Company contact</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm min-[400px]:grid-cols-2">
            <Contact
              icon={MapsLocation01Icon}
              label="Company contact"
              value={profile.companyContact}
            />
            <Contact
              icon={Call02Icon}
              label="Person of contact"
              value={profile.contactName}
            />
            <Contact icon={Call02Icon} label="Phone" value={profile.phone} />
            <Contact icon={Mail01Icon} label="Email" value={profile.email} />
          </CardContent>
        </Card>
      </section>
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["Receipt value", formatCurrency(supplier.amount), "All receipts"],
          [
            "Paid so far",
            formatCurrency(supplier.paid),
            "Settled with supplier",
          ],
          ["Remaining", formatCurrency(supplier.remaining), "Balance to clear"],
          ["Receipts", String(ledger.length), "Across active projects"],
        ].map(([label, value, detail]) => (
          <div key={label} className="rounded-xl border bg-card p-4">
            <p className="text-muted-foreground text-xs">{label}</p>
            <p className="mt-3 font-heading font-semibold text-lg">{value}</p>
            <p className="mt-1 text-muted-foreground text-xs">{detail}</p>
          </div>
        ))}
      </section>
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Payment breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-muted-foreground">Overall paid</span>
                <span className="font-heading font-semibold">
                  {totalReceipts
                    ? Math.round((supplier.paid / totalReceipts) * 100)
                    : 0}
                  %
                </span>
              </div>
              <div className="mt-2 flex h-2 gap-0.5 overflow-hidden rounded-full bg-muted">
                {statusTotals.map(({ status, value }) =>
                  value > 0 ? (
                    <div
                      key={status}
                      className={
                        status === "Full"
                          ? "bg-green-500"
                          : status === "Partial"
                            ? "bg-amber-500"
                            : "bg-rose-500"
                      }
                      style={{
                        width: `${totalReceipts ? (value / totalReceipts) * 100 : 0}%`,
                      }}
                    />
                  ) : null
                )}
              </div>
            </div>
            {statusTotals.map(({ status, count, value }) => (
              <div
                key={status}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`size-2.5 rounded-full ${status === "Full" ? "bg-green-500" : status === "Partial" ? "bg-amber-500" : "bg-rose-500"}`}
                  />
                  <div>
                    <p className="font-medium text-sm">
                      {status === "Not paid" ? "Unpaid" : status}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {count} receipt{count === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">{formatCurrency(value)}</p>
                  <p className="text-muted-foreground text-xs">
                    {totalReceipts
                      ? Math.round((value / totalReceipts) * 100)
                      : 0}
                    % of value
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
      <section>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Receipt and payment history</CardTitle>
            <span className="rounded-full bg-muted px-2.5 py-1 font-medium text-muted-foreground text-xs">
              {ledger.length} receipt{ledger.length === 1 ? "" : "s"}
            </span>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 md:hidden">
              {ledger.map((entry) => {
                const remaining = entry.receiptValue - entry.paid
                const paidPct = entry.receiptValue
                  ? Math.round((entry.paid / entry.receiptValue) * 100)
                  : 0

                return (
                  <article
                    key={entry.id}
                    className="rounded-2xl border bg-background p-4 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-1 h-10 w-1 shrink-0 rounded-full ${entry.status === "Full" ? "bg-green-500" : entry.status === "Partial" ? "bg-amber-500" : "bg-rose-500"}`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-medium">{entry.item}</p>
                            <p className="mt-1 text-muted-foreground text-xs">
                              {entry.project} · {formatShortDate(entry.date)}
                            </p>
                          </div>
                          <span
                            className={`shrink-0 rounded-full px-2 py-1 font-medium text-xs ${statusStyles[entry.status]}`}
                          >
                            {remaining > 0
                              ? formatCurrency(remaining)
                              : "Settled"}
                          </span>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-3 border-t pt-3 text-xs">
                          <div>
                            <p className="text-muted-foreground">
                              Receipt value
                            </p>
                            <p className="mt-1 font-semibold tabular-nums">
                              {formatCurrency(entry.receiptValue)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-muted-foreground">Paid</p>
                            <p className="mt-1 font-semibold tabular-nums">
                              {formatCurrency(entry.paid)} · {paidPct}%
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })}
              <div className="grid grid-cols-3 gap-2 rounded-2xl bg-muted/50 p-4 text-xs">
                <div>
                  <p className="text-muted-foreground">Total</p>
                  <p className="mt-1 font-semibold tabular-nums">
                    {formatCurrency(totalReceipts)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground">Paid</p>
                  <p className="mt-1 font-semibold text-green-700 tabular-nums">
                    {formatCurrency(supplier.paid)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground">Remaining</p>
                  <p className="mt-1 font-semibold text-rose-600 tabular-nums">
                    {formatCurrency(supplier.remaining)}
                  </p>
                </div>
              </div>
            </div>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground text-xs uppercase tracking-wider">
                    <th className="pb-3 font-medium">Project / item</th>
                    <th className="pb-3 text-right font-medium">Value</th>
                    <th className="pb-3 text-right font-medium">Paid</th>
                    <th className="pb-3 text-right font-medium">Remaining</th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.map((entry) => {
                    const remaining = entry.receiptValue - entry.paid
                    const paidPct = entry.receiptValue
                      ? Math.round((entry.paid / entry.receiptValue) * 100)
                      : 0
                    return (
                      <tr
                        key={entry.id}
                        className="border-b transition-colors last:border-0 hover:bg-muted/40"
                      >
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <span
                              className={`h-9 w-1 shrink-0 rounded-full ${entry.status === "Full" ? "bg-green-500" : entry.status === "Partial" ? "bg-amber-500" : "bg-rose-500"}`}
                            />
                            <div>
                              <p className="font-medium">{entry.item}</p>
                              <p className="mt-0.5 text-muted-foreground text-xs">
                                {entry.project} · {formatShortDate(entry.date)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-right font-medium">
                          {formatCurrency(entry.receiptValue)}
                        </td>
                        <td className="py-4 text-right">
                          <p>{formatCurrency(entry.paid)}</p>
                          <p className="mt-0.5 text-muted-foreground text-xs">
                            {paidPct}% paid
                          </p>
                        </td>
                        <td className="py-4 text-right">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 font-medium text-xs ${statusStyles[entry.status]}`}
                          >
                            {remaining > 0
                              ? formatCurrency(remaining)
                              : "Settled"}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t text-sm">
                    <td className="pt-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                      Total
                    </td>
                    <td className="pt-4 text-right font-heading font-semibold">
                      {formatCurrency(totalReceipts)}
                    </td>
                    <td className="pt-4 text-right font-heading font-semibold text-green-700">
                      {formatCurrency(supplier.paid)}
                    </td>
                    <td className="pt-4 text-right font-heading font-semibold text-rose-600">
                      {formatCurrency(supplier.remaining)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>
    </DashboardShell>
  )
}

function Contact({
  icon,
  label,
  value,
}: {
  icon: typeof Call02Icon
  label: string
  value: string
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider">
        <HugeiconsIcon icon={icon} strokeWidth={1.7} className="size-3.5" />
        {label}
      </div>
      <p className="mt-1 truncate font-medium text-xs">{value}</p>
    </div>
  )
}
