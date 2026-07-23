"use client"

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
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { useState } from "react"
import { DashboardShell } from "@/components/shared/dashboard-shell"
import { useWorkspaceSlug } from "@/components/shared/use-workspace-slug"
import { SupplierTable } from "@/components/suppliers/supplier-table"
import { updateSupplierAction } from "@/core/suppliers/actions"
import { formatCurrency } from "@/lib/format"
import {
  getSupplierListItems,
  getSupplierProfile,
  getSupplierReceiptRows,
} from "@/lib/supplier-data"
import type { ExpenseTableRow, SupplierResponse } from "@/lib/types"

export function SupplierDetailPage({
  supplier: supplierRecord,
  expenses,
}: {
  supplier: SupplierResponse
  expenses: ExpenseTableRow[]
}) {
  const [supplier] = getSupplierListItems([supplierRecord], expenses)
  const slug = useWorkspaceSlug()
  const [editOpen, setEditOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [status, setStatus] = useState(supplierRecord.status ?? "active")
  if (!supplier) return null
  const profile = getSupplierProfile(supplier.name, supplier)
  const receipts = getSupplierReceiptRows([supplierRecord], expenses).filter(
    (receipt) => receipt.supplierId === (supplier.id ?? supplier.supplier_id)
  )
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
                <BreadcrumbLink href={`/${slug}/suppliers`}>
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
        <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}>
          Edit supplier
        </Button>
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
      <section className="mt-6">
        <div className="mb-4">
          <h2 className="font-heading font-semibold text-lg">
            Receipt history
          </h2>
          <p className="mt-1 text-muted-foreground text-xs">
            All receipts recorded for this supplier.
          </p>
        </div>
        <SupplierTable receipts={receipts} suppliers={[supplier]} />
      </section>
      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open)
          if (open) {
            setStatus(supplier.status ?? "active")
            setError("")
          }
        }}
      >
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit supplier</DialogTitle>
          </DialogHeader>
          <form
            className="grid gap-4 sm:grid-cols-2"
            action={async (formData) => {
              setSaving(true)
              setError("")
              const result = await updateSupplierAction(
                supplier.id ?? supplier.supplier_id ?? "",
                {
                  name: String(formData.get("name")),
                  category: String(formData.get("category")),
                  contactName: String(formData.get("contactName")),
                  companyContact: String(formData.get("companyContact")),
                  phone: String(formData.get("phone")),
                  email: String(formData.get("email")),
                  notes: String(formData.get("notes")),
                  status: String(formData.get("status")),
                }
              )
              setSaving(false)
              if (!result.success) return setError(result.error.message)
              setEditOpen(false)
              window.location.reload()
            }}
          >
            <EditField
              name="name"
              label="Name"
              value={supplier.name}
              required
            />
            <EditField
              name="category"
              label="Category"
              value={supplier.category}
              required
            />
            <EditField
              name="contactName"
              label="Contact person"
              value={supplier.contactName ?? ""}
            />
            <EditField
              name="companyContact"
              label="Company contact"
              value={supplier.companyContact ?? ""}
            />
            <EditField
              name="phone"
              label="Phone"
              value={supplier.phone ?? ""}
            />
            <EditField
              name="email"
              label="Email (optional)"
              value={supplier.email ?? ""}
              type="email"
            />
            <EditField
              name="notes"
              label="Notes"
              value={supplier.notes ?? ""}
              className="sm:col-span-2"
            />
            <label className="grid gap-2">
              <Label>Status</Label>
              <input type="hidden" name="status" value={status} />
              <Select
                value={status}
                onValueChange={(value) => setStatus(value ?? "active")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </label>
            {error && (
              <p className="text-destructive text-sm sm:col-span-2">{error}</p>
            )}
            <DialogFooter className="sm:col-span-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setEditOpen(false)}
              >
                Cancel
              </Button>
              <Button disabled={saving}>
                {saving ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  )
}

function EditField({
  name,
  label,
  value,
  required,
  type = "text",
  className,
}: {
  name: string
  label: string
  value: string
  required?: boolean
  type?: string
  className?: string
}) {
  return (
    <label className={`grid gap-2 ${className ?? ""}`}>
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        defaultValue={value}
        required={required}
        type={type}
      />
    </label>
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
