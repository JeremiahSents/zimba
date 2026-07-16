import { ArrowLeft01Icon, File02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { DashboardShell } from "@/components/shared/dashboard-shell"
import { formatCurrency, formatShortDate } from "@/lib/format"
import type { ExpenseTableRow } from "@/lib/types"

export function ReceiptDetailPage({ items }: { items: ExpenseTableRow[] }) {
  const first = items[0]
  if (!first) return null
  const total = items.reduce((sum, item) => sum + item.amount, 0)
  return (
    <DashboardShell
      title="Receipt details"
      subtitle="Review the items recorded on this receipt."
    >
      <div className="mb-6 grid gap-3">
        <Link
          href="/admin/expenses"
          className="inline-flex items-center gap-2 font-semibold text-primary text-xs hover:underline"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={15} /> Back to expenses
        </Link>
        <div>
          <p className="text-muted-foreground text-xs">
            {first.project_name} · {formatShortDate(first.date)}
          </p>
          <h1 className="mt-1 font-heading font-semibold text-2xl tracking-tight">
            {first.supplier_name}
          </h1>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
        <section className="rounded-xl border">
          <div className="flex items-center justify-between gap-4 border-b p-4">
            <div>
              <h2 className="font-heading font-semibold text-base">
                Receipt items
              </h2>
              <p className="mt-1 text-muted-foreground text-xs">
                {items.length} item{items.length === 1 ? "" : "s"}
              </p>
            </div>
            <p className="font-heading font-semibold text-base tabular-nums">
              {formatCurrency(total)}
            </p>
          </div>
          <div className="divide-y">
            {items.map((item) => (
              <div
                key={item.id}
                className="grid gap-2 p-4 sm:grid-cols-[1fr_auto_auto] sm:items-center"
              >
                <div>
                  <p className="font-medium text-sm">{item.item_description}</p>
                  <p className="mt-1 text-muted-foreground text-xs">
                    {item.task_name} · {item.quantity ?? 1} ×{" "}
                    {formatCurrency(item.unit_rate ?? item.amount)}
                  </p>
                </div>
                <span className="text-muted-foreground text-xs">
                  {item.status}
                </span>
                <span className="font-semibold text-sm tabular-nums sm:text-right">
                  {formatCurrency(item.amount)}
                </span>
              </div>
            ))}
          </div>
        </section>
        <aside className="rounded-xl border p-5">
          <HugeiconsIcon icon={File02Icon} size={22} className="text-primary" />
          <h2 className="mt-3 font-heading font-semibold text-base">
            Receipt attachment
          </h2>
          {first.receipt_url ? (
            <a
              href={first.receipt_url}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex font-medium text-primary text-xs hover:underline"
            >
              View uploaded receipt
            </a>
          ) : (
            <p className="mt-2 text-muted-foreground text-xs">
              No receipt file attached.
            </p>
          )}
        </aside>
      </div>
    </DashboardShell>
  )
}
