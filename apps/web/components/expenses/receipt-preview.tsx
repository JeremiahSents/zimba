import { formatCurrency, formatShortDate } from "@/lib/format"
import type { ProjectDetailResponse, SupplierResponse } from "@/lib/types"

type PreviewLine = {
  id: number
  description: string
  quantity: string
  unitAmount: string
}

type ReceiptPreviewProps = {
  project: ProjectDetailResponse
  supplier?: SupplierResponse
  organizationName: string
  purchaseDate: string
  lines: PreviewLine[]
  total: number
  paid: number
  outstanding: number
  paymentStatus: string
  paymentStatusClass: string
  hiddenOnMobile: boolean
}

export function ReceiptPreview({
  project,
  supplier,
  organizationName,
  purchaseDate,
  lines,
  total,
  paid,
  outstanding,
  paymentStatus,
  paymentStatusClass,
  hiddenOnMobile,
}: ReceiptPreviewProps) {
  return (
    <aside
      className={`${hiddenOnMobile ? "hidden md:block" : "block"} h-full self-stretch`}
    >
      <div className="flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="border-b bg-muted/20 p-6">
          <p className="text-muted-foreground text-xs">EXPENSE RECEIPT</p>
          <div className="mt-3 flex items-start justify-between gap-4">
            <div>
              <h3 className="font-heading font-semibold text-2xl">
                {supplier?.name ?? "Supplier"}
              </h3>
              <p className="mt-1 text-muted-foreground text-sm">
                {project.name}
              </p>
            </div>
            <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 font-semibold text-orange-700 text-xs">
              DRAFT
            </span>
          </div>
          <p className="mt-4 font-mono text-muted-foreground text-xs">
            Receipt #: Auto-generated on save
          </p>
          <div className="mt-5 grid grid-cols-2 gap-4 rounded-xl border bg-background/70 p-4 text-xs">
            <div>
              <p className="font-semibold text-muted-foreground uppercase tracking-wide">
                From
              </p>
              <p className="mt-1 font-semibold text-sm">
                {supplier?.name ?? "Supplier"}
              </p>
              <p className="mt-1 text-muted-foreground">
                {supplier?.phone ||
                  supplier?.companyContact ||
                  "Supplier details"}
              </p>
            </div>
            <div className="border-l pl-4">
              <p className="font-semibold text-muted-foreground uppercase tracking-wide">
                Billed to
              </p>
              <p className="mt-1 font-semibold text-sm">{organizationName}</p>
              <p className="mt-1 text-muted-foreground">{project.name}</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-5 border-b p-6 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Purchase date</p>
            <p className="mt-1 font-medium">{formatShortDate(purchaseDate)}</p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground text-xs">Status</p>
            <span
              className={`mt-2 inline-flex rounded-full border px-2.5 py-1 font-semibold text-xs ${paymentStatusClass}`}
            >
              {paymentStatus}
            </span>
          </div>
        </div>
        <div className="flex flex-1 flex-col p-6">
          <div className="grid grid-cols-[minmax(0,1fr)_2.5rem_5.5rem] border-b pb-2 font-semibold text-[10px] text-muted-foreground uppercase">
            <span>Item</span>
            <span className="text-right">Qty</span>
            <span className="text-right">Total</span>
          </div>
          {lines.map((line) => (
            <div
              key={line.id}
              className="grid grid-cols-[minmax(0,1fr)_2.5rem_5.5rem] border-b py-3 text-xs"
            >
              <span className="truncate pr-2">
                {line.description || "New item"}
              </span>
              <span className="text-right tabular-nums">
                {line.quantity || 0}
              </span>
              <span className="text-right font-medium tabular-nums">
                {formatCurrency(
                  Number(line.quantity || 0) * Number(line.unitAmount || 0)
                )}
              </span>
            </div>
          ))}
          <div className="mt-auto grid w-full gap-2 pt-8 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total</span>
              <strong>{formatCurrency(total)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Paid</span>
              <strong>{formatCurrency(paid)}</strong>
            </div>
            <div className="mt-1 flex justify-between border-t pt-3 text-base">
              <span>Outstanding</span>
              <strong>{formatCurrency(outstanding)}</strong>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
