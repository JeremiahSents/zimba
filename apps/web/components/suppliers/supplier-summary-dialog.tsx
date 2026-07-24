"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { formatCurrency } from "@/lib/format"
import type { SupplierListItem } from "@/lib/supplier-data"

export function SupplierSummaryDialog({
  supplier,
  open,
  onOpenChange,
}: {
  supplier?: SupplierListItem
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{supplier?.name}</DialogTitle>
          <DialogDescription>Supplier account summary</DialogDescription>
        </DialogHeader>
        {supplier && (
          <div className="grid grid-cols-3 gap-3 rounded-xl border bg-muted/25 p-4">
            <Metric
              label="Receipt total"
              value={formatCurrency(supplier.amount)}
            />
            <Metric label="Paid" value={formatCurrency(supplier.paid)} />
            <Metric
              label="Balance"
              value={formatCurrency(supplier.remaining)}
            />
          </div>
        )}
        {supplier && (
          <dl className="grid gap-3 text-sm">
            <Contact label="Phone" value={supplier.phone} />
            <Contact label="Email" value={supplier.email} />
            <Contact
              label="Contact"
              value={supplier.contactName ?? supplier.companyContact}
            />
          </dl>
        )}
      </DialogContent>
    </Dialog>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] text-muted-foreground uppercase tracking-wider">
        {label}
      </dt>
      <dd className="mt-1 font-semibold text-sm tabular-nums">{value}</dd>
    </div>
  )
}
function Contact({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="truncate font-medium">{value || "Not provided"}</dd>
    </div>
  )
}
