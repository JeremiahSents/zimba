import { redirect } from "next/navigation"

// Kept only as a compatibility route for stale client navigations. Receipt details
// are rendered exclusively by the canonical non-modal route.
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/admin/expenses/receipts/${id}`)
}
