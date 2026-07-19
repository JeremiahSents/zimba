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
import { Card, CardContent } from "@workspace/ui/components/card"
import { DashboardShell } from "@/components/shared/dashboard-shell"
import { formatCurrency } from "@/lib/format"
import { getSupplierListItems, getSupplierProfile } from "@/lib/supplier-data"
import type { ExpenseTableRow, SupplierResponse } from "@/lib/types"

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
  const initials = supplier.name
    .split(/\s|\//)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
  return (
    <DashboardShell
      title={supplier.name}
      subtitle="Supplier profile and account summary."
    >
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
            Contact information and current supplier balance.
          </p>
        </div>
        <span className="rounded-full bg-green-50 px-2.5 py-1 font-medium text-green-700 text-xs">
          Active supplier
        </span>
      </div>
      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card className="border-primary/15 bg-primary/[0.03]">
          <CardContent className="flex flex-wrap items-center gap-4 p-6">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-primary font-heading font-semibold text-2xl text-primary-foreground">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-heading font-semibold text-lg">
                {supplier.name}
              </p>
              <p className="mt-1 text-muted-foreground text-sm">
                {supplier.category} supplier
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <Contact
                  icon={MapsLocation01Icon}
                  label="Company"
                  value={profile.companyContact}
                />
                <Contact
                  icon={Call02Icon}
                  label="Phone"
                  value={profile.phone}
                />
                <Contact
                  icon={Mail01Icon}
                  label="Email"
                  value={profile.email}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="grid grid-cols-2 gap-5 p-6">
            <Summary
              label="Receipt value"
              value={formatCurrency(supplier.amount)}
              detail={`${supplier.payments} recorded receipts`}
            />
            <Summary
              label="Paid"
              value={formatCurrency(supplier.paid)}
              detail={`${supplier.amount ? Math.round((supplier.paid / supplier.amount) * 100) : 0}% settled`}
            />
            <Summary
              label="Remaining"
              value={formatCurrency(supplier.remaining)}
              detail="Open balance"
            />
          </CardContent>
        </Card>
      </section>
    </DashboardShell>
  )
}

function Summary({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail: string
}) {
  return (
    <div>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="mt-2 font-heading font-semibold text-lg">{value}</p>
      <p className="mt-1 text-muted-foreground text-xs">{detail}</p>
    </div>
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
