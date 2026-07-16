import "server-only"

import { requireZimbaApiSession } from "@/lib/api/auth"
import { getPayableExpense } from "@/lib/api/client"

export async function getPayableReceipt(expenseId: number) {
  const session = await requireZimbaApiSession()
  return getPayableExpense(session, expenseId)
}
