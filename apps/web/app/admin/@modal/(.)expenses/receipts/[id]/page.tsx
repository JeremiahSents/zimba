import { notFound } from "next/navigation"
import { ReceiptModal } from "@/components/expenses/receipt-modal"
import { getDashboardOverviewData } from "@/core/dashboard/service"
import { getPayableExpense } from "@/core/expenses/service"
import { ApplicationError } from "@/core/shared/errors"
import type { PayableExpenseResponse } from "@/lib/types"

export const dynamic = "force-dynamic"

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let payable: PayableExpenseResponse
  try {
    payable = await getPayableExpense(id)
  } catch (error) {
    if (error instanceof ApplicationError && error.code === "NOT_FOUND") notFound()
    throw error
  }
  const dashboard = await getDashboardOverviewData()
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
    status: payable.settlement_status === "paid" ? "Full" as const : payable.settlement_status === "partially_paid" ? "Partial" as const : "Not paid" as const,
  }))
  const supplier = dashboard.suppliers.find((item) => item.supplier_id === payable.supplier_id)
  return <ReceiptModal items={items} supplier={supplier} payable={payable} />
}
