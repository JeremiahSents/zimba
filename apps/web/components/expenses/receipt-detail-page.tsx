import { ArrowLeft01Icon, File02Icon, PrinterIcon, Download01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { DashboardShell } from "@/components/shared/dashboard-shell"
import { formatCurrency, formatShortDate } from "@/lib/format"
import type { ExpenseTableRow, SupplierResponse } from "@/lib/types"

export function ReceiptDetailPage({ items, supplier }: { items: ExpenseTableRow[], supplier?: SupplierResponse }) {
  const first = items[0]
  if (!first) return null
  const total = items.reduce((sum, item) => sum + item.amount, 0)
  
  return (
    <DashboardShell
      title="Receipt Details"
      subtitle="Review the items recorded on this receipt."
    >
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/admin/expenses"
          className="inline-flex items-center gap-2 font-semibold text-primary text-sm hover:underline transition-colors"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} /> Back to expenses
        </Link>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-lg border bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground transition-all">
            <HugeiconsIcon icon={PrinterIcon} size={16} />
            Print
          </button>
          {first.receipt_url && (
            <a
              href={first.receipt_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-all"
            >
              <HugeiconsIcon icon={Download01Icon} size={16} />
              View Original File
            </a>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-4xl">
        {/* Receipt Paper Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden text-gray-900">
          <div className="p-8 sm:p-12">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-8 mb-8 gap-6">
              <div className="flex items-center gap-3">
                <div className="bg-primary text-primary-foreground p-3 rounded-lg flex items-center justify-center h-12 w-12 font-bold text-xl">
                  {first.project_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="font-heading font-bold text-2xl tracking-tight uppercase">
                    {first.project_name}
                  </h1>
                  <p className="text-gray-500 text-sm mt-0.5">Project Expense</p>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <h2 className="font-heading font-bold text-4xl uppercase tracking-wider text-gray-900">
                  Receipt
                </h2>
                <div className="mt-3 space-y-1 text-sm text-gray-600 font-medium">
                  <p>Receipt No: RCPT-{first.id.toString().padStart(4, '0')}</p>
                  <p>Date: {formatShortDate(first.date)}</p>
                  <div className="flex items-center sm:justify-end gap-2 mt-1">
                    <span>Status:</span>
                    <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                      {first.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Addresses */}
            <div className="grid sm:grid-cols-2 gap-8 mb-12 rounded-lg bg-gray-50/50 p-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                  FROM
                </p>
                <h3 className="font-semibold text-lg text-gray-900">
                  {first.supplier_name}
                </h3>
                <div className="text-sm text-gray-600 mt-2 space-y-1">
                  {supplier?.phone && <p>{supplier.phone}</p>}
                  {supplier?.email && <p>{supplier.email}</p>}
                  {supplier?.companyContact && <p>{supplier.companyContact}</p>}
                  {(!supplier?.phone && !supplier?.email && !supplier?.companyContact) && (
                    <p className="text-muted-foreground">Supplier details</p>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                  BILLED TO
                </p>
                <div className="space-y-2 text-sm">
                  <h3 className="font-semibold text-lg text-gray-900">
                    Zimba consultants
                  </h3>
                  <p className="text-gray-600">{first.project_name}</p>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-8 overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="border-y-2 border-gray-200">
                    <th className="py-4 px-2 font-bold text-gray-900 uppercase tracking-wider text-xs w-12 text-center">No</th>
                    <th className="py-4 px-2 font-bold text-gray-900 uppercase tracking-wider text-xs">Item Description</th>
                    <th className="py-4 px-2 font-bold text-gray-900 uppercase tracking-wider text-xs text-right">Price</th>
                    <th className="py-4 px-2 font-bold text-gray-900 uppercase tracking-wider text-xs text-center w-24">Quantity</th>
                    <th className="py-4 px-2 font-bold text-gray-900 uppercase tracking-wider text-xs text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="py-4 px-2 text-gray-500 text-center">{index + 1}.</td>
                      <td className="py-4 px-2">
                        <p className="font-medium text-gray-900">{item.item_description}</p>
                        <p className="text-xs text-gray-500 mt-1">{item.task_name}</p>
                      </td>
                      <td className="py-4 px-2 text-right tabular-nums text-gray-600">
                        {formatCurrency(item.unit_rate ?? item.amount)}
                      </td>
                      <td className="py-4 px-2 text-center text-gray-600">
                        {item.quantity ?? 1}
                      </td>
                      <td className="py-4 px-2 text-right font-semibold tabular-nums text-gray-900">
                        {formatCurrency(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Section */}
            <div className="flex flex-col sm:flex-row justify-between items-end sm:items-start gap-8 pt-6 border-t border-gray-100">
              <div className="w-full sm:w-1/2">
                {/* Optional note or terms section */}
              </div>
              <div className="w-full sm:w-80 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-gray-500 uppercase">Subtotal:</span>
                  <span className="font-medium tabular-nums text-gray-900">{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-gray-500 uppercase">Tax:</span>
                  <span className="font-medium tabular-nums text-gray-900">{formatCurrency(0)}</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t-2 border-gray-900">
                  <span className="font-bold text-gray-900 uppercase tracking-wider">Grand Total:</span>
                  <span className="font-bold text-xl tabular-nums text-gray-900">{formatCurrency(total)}</span>
                </div>
                
                {/* Visual design element for total */}
                <div className="mt-6 p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between shadow-sm">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Total Due</span>
                  <span className="text-3xl font-bold tracking-tight text-primary tabular-nums">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
