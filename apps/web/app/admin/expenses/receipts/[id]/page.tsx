import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ReceiptDetailPage } from "@/components/expenses/receipt-detail-page"
import { getDashboardOverviewData } from "@/lib/api/dashboard"
import { toUiExpenseStatus } from "@/lib/api/normalizers"
import { getPayableReceipt } from "@/lib/api/receipts"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Receipt details | Zimba" }

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ source?: string }>
}) {
  const { id } = await params
  const { source } = await searchParams
  const receiptId = Number(id)
  const data = await getDashboardOverviewData()
  if (source === "payable") {
    const payable = await getPayableReceipt(receiptId)
    const items = payable.lines.map((line) => ({
      id: line.id,
      receipt_id: payable.id,
      project_id: payable.project_id,
      project_name: payable.project_name ?? "Project",
      date: payable.expense_date ?? "",
      task_name: line.allocation_name,
      supplier_name: payable.supplier_name ?? "Supplier",
      item_description: line.description,
      amount: line.line_amount,
      quantity: line.quantity,
      unit_rate: line.unit_amount,
      receipt_url: payable.receipt_file_url,
      source: "payable",
      status: toUiExpenseStatus(payable.settlement_status),
    }))
    if (!items.length) notFound()
    const supplier = data.suppliers.find(
      (item) => item.supplier_id === payable.supplier_id
    )
    return (
      <ReceiptDetailPage items={items} supplier={supplier} payable={payable} />
    )
  }
  const items = data.expenses.filter(
    (expense) => (expense.receipt_id ?? expense.id) === receiptId
  )
  if (!items.length) notFound()

  const firstItem = items[0]
  const supplier = data.suppliers.find(
    (s) => s.name === firstItem?.supplier_name
  )

  return <ReceiptDetailPage items={items} supplier={supplier} />
}
