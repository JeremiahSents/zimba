import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ReceiptDetailPage } from "@/components/expenses/receipt-detail-page"
import { getDashboardOverviewData } from "@/lib/api/dashboard"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Receipt details | Zimba" }

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const receiptId = Number(id)
  const data = await getDashboardOverviewData()
  const items = data.expenses.filter(
    (expense) => (expense.receipt_id ?? expense.id) === receiptId
  )
  if (!items.length) notFound()
  return <ReceiptDetailPage items={items} />
}
